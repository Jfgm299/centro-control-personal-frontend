import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateTrip, useUpdateTrip } from '../../hooks/useTripMutations'

const FIELD = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-900'

export default function TripForm({ trip = null, onClose }) {
  const { t } = useTranslation('travels')
  const isEdit = !!trip

  const [form, setForm] = useState({
    title:       trip?.title       ?? '',
    destination: trip?.destination ?? '',
    start_date:  trip?.start_date  ?? '',
    end_date:    trip?.end_date    ?? '',
    description: trip?.description ?? '',
  })
  
  // Location state from autocomplete
  const [location, setLocation] = useState({
    lat:          trip?.lat          ?? null,
    lon:          trip?.lon          ?? null,
    country_code: trip?.country_code ?? null,
  })

  const [error, setError] = useState(null)
  
  // Autocomplete state
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef(null)
  const suggestionsRef = useRef(null)

  const createTrip = useCreateTrip()
  const updateTrip = useUpdateTrip(trip?.id)
  const isPending  = createTrip.isPending || updateTrip.isPending

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=5`,
        {
          headers: {
            'Accept-Language': 'es,en',
          }
        }
      )
      const data = await response.json()
      setSuggestions(data)
    } catch (err) {
      console.error('Nominatim error:', err)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSuggestion = (suggestion) => {
    const { lat, lon, address, display_name } = suggestion
    
    // Extract country code (ISO 3166-1 alpha-2)
    const countryCode = address?.country_code?.toUpperCase() || null

    // Use city, town, or village as destination
    const destination = 
      address?.city || 
      address?.town || 
      address?.village || 
      address?.municipality ||
      address?.county ||
      address?.state ||
      address?.country ||
      display_name.split(',')[0]

    setLocation({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      country_code: countryCode,
    })

    setForm(f => ({
      ...f,
      title: destination,
      destination: destination,
    }))

    setQuery(destination)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.title.trim())       return setError(t('form.errorTitle'))
    if (!form.destination.trim()) return setError(t('form.errorDestination'))

    const payload = {
      title:        form.title.trim(),
      destination:  form.destination.trim(),
      country_code: location.country_code || undefined,
      lat:          location.lat,
      lon:          location.lon,
      start_date:   form.start_date || undefined,
      end_date:     form.end_date   || undefined,
      description:  form.description.trim() || undefined,
    }

    try {
      if (isEdit) await updateTrip.mutateAsync(payload)
      else        await createTrip.mutateAsync(payload)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail ?? t('form.errorGeneric'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? t('form.titleEdit') : t('form.titleCreate')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Destination search with autocomplete */}
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              {t('form.destination')} *
            </label>
            <input 
              className={FIELD} 
              value={query} 
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t('form.destinationPlaceholder')}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {sug.address?.city || sug.address?.town || sug.address?.village || sug.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {sug.display_name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Buscando...
                </div>
              </div>
            )}
          </div>

          {/* Selected location info */}
          {location.lat && location.lon && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
              ✓ Ubicación: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              {location.country_code && ` · ${location.country_code}`}
            </div>
          )}

          {/* Title (optional override) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              {t('form.title')}
            </label>
            <input 
              className={FIELD} 
              value={form.title} 
              onChange={set('title')}
              placeholder={t('form.titlePlaceholder')} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('form.startDate')}</label>
              <input className={FIELD} type="date" value={form.start_date} onChange={set('start_date')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('form.endDate')}</label>
              <input className={FIELD} type="date" value={form.end_date} onChange={set('end_date')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('form.description')}</label>
            <textarea className={`${FIELD} resize-none`} rows={3}
                      value={form.description} onChange={set('description')}
                      placeholder={t('form.descriptionPlaceholder')} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            {t('form.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50 transition-colors">
            {isPending ? t('form.saving') : isEdit ? t('form.save') : t('form.create')}
          </button>
        </div>
      </div>
    </div>
  )
}