import { useTranslation } from 'react-i18next'

export default function AutomationEmptyState({ onCreateClick }) {
  const { t } = useTranslation('automations')

  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">⚡</div>
      <p className="text-white/60 text-lg font-medium mb-2">
        {t('list.empty')}
      </p>
      <p className="text-white/30 text-sm mb-6">
        {t('list.emptyAction')}
      </p>
      <button
        onClick={onCreateClick}
        className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95"
      >
        + {t('list.create')}
      </button>
    </div>
  )
}
