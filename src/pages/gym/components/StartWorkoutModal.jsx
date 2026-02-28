import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MUSCLE_GROUPS, MUSCLE_GROUP_COLORS } from '../constants'

export default function StartWorkoutModal({ onStart, onClose, isLoading }) {
  const { t } = useTranslation('gym')
  const [selected, setSelected] = useState([])
  const [notes, setNotes] = useState('')

  const toggle = (group) =>
    setSelected((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selected.length) return
    onStart({ muscle_groups: selected, notes: notes || null })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t('start.title')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('start.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Muscle group selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              {t('start.muscleGroups')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MUSCLE_GROUPS.map((group) => {
                const isSelected = selected.includes(group)
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggle(group)}
                    className={`
                      py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center
                      ${isSelected
                        ? 'text-white border-transparent'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                      }
                    `}
                    style={isSelected ? { background: MUSCLE_GROUP_COLORS[group] } : {}}
                  >
                    {t(`muscles.${group}`, { defaultValue: group })}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('start.notes')}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('start.notesPlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!selected.length || isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? t('common.saving') : t('start.begin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}