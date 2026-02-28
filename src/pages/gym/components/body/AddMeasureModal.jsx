import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AddMeasureModal({ onAdd, onClose, isLoading }) {
  const { t } = useTranslation('gym')
  const [weight, setWeight]   = useState('')
  const [fat, setFat]         = useState('')
  const [notes, setNotes]     = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!weight) return
    onAdd({
      weight_kg:        parseFloat(weight),
      body_fat_percent: fat ? parseFloat(fat) : null,
      notes:            notes || null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{t('body.addTitle')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('body.weight')} *</label>
            <div className="relative">
              <input
                type="number" required autoFocus
                min="1" max="500" step="0.1"
                value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="75.0"
                className="w-full pr-10 pl-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('body.fat')}</label>
            <div className="relative">
              <input
                type="number"
                min="0" max="100" step="0.1"
                value={fat} onChange={(e) => setFat(e.target.value)}
                placeholder="18.5"
                className="w-full pr-10 pl-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('body.notes')}</label>
            <input
              type="text"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={t('body.notesPlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={!weight || isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-all">
              {t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}