import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAddFlight } from '../hooks/useFlights'

export default function AddFlightModal({ onClose }) {
  const { t }    = useTranslation('flights')
  const addFlight = useAddFlight()

  const [form, setForm] = useState({
    flight_number: '',
    flight_date: '',
    notes: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async () => {
    if (!form.flight_number || !form.flight_date) {
      setError('Flight number and date are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await addFlight.mutateAsync(form)
      onClose()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Error adding flight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">{t('upcoming.addFlight')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Flight Number *
            </label>
            <input
              type="text"
              placeholder="VY 1234"
              value={form.flight_number}
              onChange={e => set('flight_number', e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 font-mono text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Date *
            </label>
            <input
              type="date"
              value={form.flight_date}
              onChange={e => set('flight_date', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Notes (optional)
            </label>
            <textarea
              placeholder="Seat 12A, business trip..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : t('upcoming.addFlight')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}