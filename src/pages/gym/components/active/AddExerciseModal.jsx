import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EXERCISE_TYPES } from '../../constants'

export default function AddExerciseModal({ onAdd, onClose, isLoading }) {
  const { t } = useTranslation('gym')
  const [name, setName] = useState('')
  const [type, setType] = useState(EXERCISE_TYPES.WEIGHT_REPS)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), exercise_type: type, notes: null })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{t('exercise.addTitle')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('exercise.name')}</label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('exercise.namePlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('exercise.type')}</label>
            <div className="flex gap-2">
              {Object.values(EXERCISE_TYPES).map((et) => (
                <button
                  key={et}
                  type="button"
                  onClick={() => setType(et)}
                  className={`
                    flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${type === et
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }
                  `}
                >
                  {et === EXERCISE_TYPES.WEIGHT_REPS ? `🏋️ ${t('exercise.typeWeights')}` : `🏃 ${t('exercise.typeCardio')}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={!name.trim() || isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-all">
              {t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}