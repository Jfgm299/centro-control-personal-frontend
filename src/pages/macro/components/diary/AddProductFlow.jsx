import { useRef, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useBarcodeFromImage } from '../../hooks/useBarcodeFromImage'
import { useAddDiaryEntry } from '../../hooks/useDiaryMutations'
import { NUTRISCORE_COLORS } from '../../constants'
import BarcodeScannerModal from './BarcodeScannerModal'

const STEP = { UPLOAD: 'upload', LOADING: 'loading', CONFIRM: 'confirm', SEARCH: 'search' }

const ERROR_MESSAGES = {
  NO_BARCODE_IN_IMAGE: 'add.error.noBarcode',
  IMAGE_LOAD_FAILED:   'add.error.imageLoad',
  UNKNOWN_ERROR:       'add.error.unknown',
}

async function hasCamera() {
  if (!navigator.mediaDevices?.enumerateDevices) return false
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some((d) => d.kind === 'videoinput')
  } catch { return false }
}

export default function AddProductFlow({ mealType, date, onClose }) {
  const { t } = useTranslation('macro')
  const fileRef = useRef(null)

  const { decodeImage, isDecoding } = useBarcodeFromImage()
  const addEntry = useAddDiaryEntry(date)

  const [step, setStep]           = useState(STEP.UPLOAD)
  const [product, setProduct]     = useState(null)
  const [amountG, setAmountG]     = useState('')
  const [selectedMeal, setSelectedMeal] = useState(mealType)
  const [error, setError]         = useState(null)
  const [searchQ, setSearchQ]     = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const debounceRef = useRef(null)

  // ── Autocomplete while typing ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== STEP.SEARCH) return
    const q = searchQ.trim()

    // Clear results if query too short
    if (q.length < 2) {
      setSearchResults([])
      setSearching(false)
      clearTimeout(debounceRef.current)
      return
    }

    setSearching(true)
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/v1/macros/products/search', {
          params: { q, limit: 8 },
        })
        setSearchResults(data)
      } catch {
        // Silently fail for autocomplete — don't show error banner
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [searchQ, step])

  // ── Camera ─────────────────────────────────────────────────────────────────
  const handleScanPress = async () => {
    const cameraAvailable = await hasCamera()
    if (cameraAvailable) setShowCamera(true)
    else fileRef.current?.click()
  }

  const handleCameraDetected = useCallback(async (barcode) => {
    setShowCamera(false)
    await fetchProductByBarcode(barcode)
  }, []) // eslint-disable-line

  // ── Static image ───────────────────────────────────────────────────────────
  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setError(null)
    setStep(STEP.LOADING)
    try {
      const barcode = await decodeImage(file)
      await fetchProductByBarcode(barcode)
    } catch (err) {
      const code = err.message || 'UNKNOWN_ERROR'
      setError(t(ERROR_MESSAGES[code] ?? 'add.error.unknown'))
      setStep(STEP.UPLOAD)
    }
  }

  // ── Barcode fetch ──────────────────────────────────────────────────────────
  async function fetchProductByBarcode(barcode) {
    setStep(STEP.LOADING)
    try {
      const { data } = await api.get(
        `/api/v1/macros/products/barcode/${encodeURIComponent(barcode)}`
      )
      setProduct(data)
      setAmountG(data.serving_quantity_g ? String(data.serving_quantity_g) : '100')
      setStep(STEP.CONFIRM)
    } catch (err) {
      if (err.response?.status === 404) {
        setError(t('add.error.productNotFound'))
        setStep(STEP.SEARCH)
      } else {
        setError(t('add.error.unknown'))
        setStep(STEP.UPLOAD)
      }
    }
  }

  function selectProduct(p) {
    setProduct(p)
    setAmountG(p.serving_quantity_g ? String(p.serving_quantity_g) : '100')
    setStep(STEP.CONFIRM)
    setSearchResults([])
  }

  async function handleConfirm() {
    const amount = parseFloat(amountG)
    if (!product || isNaN(amount) || amount <= 0) return
    try {
      await addEntry.mutateAsync({
        product_id: product.id,
        entry_date: date,
        meal_type:  selectedMeal,
        amount_g:   amount,
      })
      onClose()
    } catch {
      setError(t('add.error.unknown'))
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const fmt     = (v, d = 1) => (v == null ? '—' : Number(v).toFixed(d))
  const nsColor = product?.nutriscore
    ? NUTRISCORE_COLORS[product.nutriscore.toLowerCase()] ?? '#9ca3af'
    : '#9ca3af'

  return (
    <>
      {showCamera && (
        <BarcodeScannerModal
          onDetected={handleCameraDetected}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm font-medium">{t('add.title')}</span>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-500 text-xs">
            {error}
          </div>
        )}

        {/* STEP: UPLOAD */}
        {(step === STEP.UPLOAD || step === STEP.LOADING) && (
          <div className="space-y-3">
            <button
              onClick={handleScanPress}
              disabled={step === STEP.LOADING}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {step === STEP.LOADING ? (
                <><span className="animate-spin text-lg">⟳</span>{t('add.decoding')}</>
              ) : (
                <><span className="text-xl">📷</span>{t('add.scanBarcode') ?? 'Escanear código de barras'}</>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">o</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-[#f59e0b] bg-amber-50' : 'border-gray-200 hover:border-gray-300'
              } ${step === STEP.LOADING ? 'opacity-60 pointer-events-none' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])} />
              <p className="text-gray-400 text-xs">{t('add.uploadHint') ?? 'Sube una foto del código de barras'}</p>
            </div>

            <button
              onClick={() => { setStep(STEP.SEARCH); setError(null) }}
              className="w-full text-center text-gray-400 hover:text-gray-600 text-xs py-1"
            >
              {t('add.searchManually') ?? 'Buscar producto por nombre →'}
            </button>
          </div>
        )}

        {/* STEP: SEARCH */}
        {step === STEP.SEARCH && (
          <div className="space-y-3">
            <p className="text-gray-500 text-xs">{t('add.searchFallback')}</p>

            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={t('add.searchPlaceholder')}
                autoFocus
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm placeholder-gray-400 outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] pr-8"
              />
              {/* Spinner inside input */}
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm animate-spin">
                  ⟳
                </span>
              )}
            </div>

            {/* Autocomplete results */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-50">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-gray-300">🍽</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{p.product_name}</p>
                      {p.brand && <p className="text-gray-400 text-xs truncate">{p.brand}</p>}
                    </div>
                    {p.energy_kcal_100g != null && (
                      <span className="text-[#f59e0b] text-xs font-semibold flex-shrink-0">
                        {Math.round(p.energy_kcal_100g)} kcal
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!searching && searchQ.trim().length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-2">
                Sin resultados para "{searchQ}"
              </p>
            )}

            <button
              onClick={() => { setStep(STEP.UPLOAD); setError(null); setSearchQ(''); setSearchResults([]) }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ← {t('add.backToUpload')}
            </button>
          </div>
        )}

        {/* STEP: CONFIRM */}
        {step === STEP.CONFIRM && product && (
          <div className="space-y-4">
            <div className="flex gap-3 bg-white border border-gray-200 rounded-xl p-3">
              {product.image_url && (
                <img src={product.image_url} alt={product.product_name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p className="text-gray-800 text-sm font-semibold flex-1 leading-tight">{product.product_name}</p>
                  {product.nutriscore && (
                    <span className="text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: nsColor, fontSize: '0.6rem' }}>
                      {product.nutriscore}
                    </span>
                  )}
                </div>
                {product.brand && <p className="text-gray-400 text-xs mt-0.5">{product.brand}</p>}
                <div className="flex gap-3 mt-2">
                  {[
                    { label: 'kcal', value: fmt(product.energy_kcal_100g, 0), color: '#f59e0b' },
                    { label: 'P',    value: fmt(product.proteins_100g),       color: '#3b82f6' },
                    { label: 'C',    value: fmt(product.carbohydrates_100g),  color: '#10b981' },
                    { label: 'G',    value: fmt(product.fat_100g),            color: '#f43f5e' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs font-semibold" style={{ color }}>{value}</p>
                      <p className="text-gray-400 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-xs mt-1">{t('add.per100g')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-500 text-sm flex-shrink-0">{t('add.amount')}</label>
              <input type="number" min="1" max="5000" step="1" value={amountG}
                onChange={(e) => setAmountG(e.target.value)}
                className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-800 text-sm text-center outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]" />
              <span className="text-gray-400 text-sm">g</span>
              {product.energy_kcal_100g != null && parseFloat(amountG) > 0 && (
                <span className="text-[#f59e0b] text-sm font-semibold ml-auto">
                  ≈ {Math.round(product.energy_kcal_100g * parseFloat(amountG) / 100)} kcal
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setStep(STEP.UPLOAD); setProduct(null); setError(null) }}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={addEntry.isPending || !amountG || parseFloat(amountG) <= 0}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {addEntry.isPending ? t('common.saving') : t('add.addToDiary')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}