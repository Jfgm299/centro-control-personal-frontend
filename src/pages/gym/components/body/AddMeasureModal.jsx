import { useState } from 'react'
import { createPortal } from 'react-dom'
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
      body_fat_percentage: fat ? parseFloat(fat) : null,
      notes:            notes || null,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{t('body.addTitle')}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{t('body.weight')} *</label>
            <div className="relative">
              <input
                type="number" required autoFocus
                min="1" max="500" step="0.1"
                value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="75.0"
                className="w-full pr-12 pl-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">kg</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{t('body.fat')}</label>
            <div className="relative">
              <input
                type="number"
                min="0" max="100" step="0.1"
                value={fat} onChange={(e) => setFat(e.target.value)}
                placeholder="18.5"
                className="w-full pr-12 pl-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{t('body.notes')}</label>
            <input
              type="text"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={t('body.notesPlaceholder')}
              className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-white/10 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-white/70 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={!weight || isLoading}
              className="flex-1 py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all border border-white/30 shadow-md"
            >
              {isLoading ? t('common.saving') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}