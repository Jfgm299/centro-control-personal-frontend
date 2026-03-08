import { useTranslation } from 'react-i18next'

export default function AutomationEmptyState({ onCreateClick }) {
  const { t } = useTranslation('automations')

  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 40, textAlign: 'center',
    }}>
      <span style={{ fontSize: 48 }}>⚡</span>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>
        {t('list.empty')}
      </p>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
        {t('list.emptyAction')}
      </p>
      <button onClick={onCreateClick} style={{
        marginTop: 8,
        padding: '8px 20px',
        background: '#0f172a', color: '#fff',
        border: 'none', borderRadius: 10,
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}>
        + {t('list.create')}
      </button>
    </div>
  )
}