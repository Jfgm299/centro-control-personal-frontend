import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export default function StartWorkoutModal({ onStart, onClose, isLoading }) {
  const { t } = useTranslation('gym')

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">{t('start.title')}</h2>
            <p className="text-xs text-white/60 mt-0.5">{t('start.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          <p className="text-sm text-white/70 text-center leading-relaxed">
            {t('start.readyMessage', { defaultValue: 'Los grupos musculares se registrarán automáticamente según los ejercicios que hagas.' })}
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-white/70 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => onStart({ muscle_groups: [], notes: null })}
              disabled={isLoading}
              className="flex-1 py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all border border-white/30 shadow-md drop-shadow-sm"
            >
              {isLoading ? t('common.saving') : t('start.begin')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}