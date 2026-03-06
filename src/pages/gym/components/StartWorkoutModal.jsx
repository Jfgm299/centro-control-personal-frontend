import { useTranslation } from 'react-i18next'

export default function StartWorkoutModal({ onStart, onClose, isLoading }) {
  const { t } = useTranslation('gym')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
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

        <div className="px-6 py-6 flex flex-col gap-4">
          <p className="text-sm text-slate-500 text-center">
            {t('start.readyMessage', { defaultValue: 'Los grupos musculares se registrarán automáticamente según los ejercicios que hagas.' })}
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => onStart({ muscle_groups: [], notes: null })}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-all"
            >
              {isLoading ? t('common.saving') : t('start.begin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}