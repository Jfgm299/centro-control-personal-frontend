import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomations } from './hooks/useAutomations'
import { useAutomationMutations } from './hooks/useAutomationMutations'
import AutomationCard          from './components/list/AutomationCard'
import AutomationEmptyState    from './components/list/AutomationEmptyState'
import CreateAutomationModal   from './components/list/CreateAutomationModal'
import ApiKeysManager          from './components/list/ApiKeysManager'

const TABS = [
  { key: 'automations', label: '⚡ Automatizaciones' },
  { key: 'apikeys',     label: '🔑 API Keys' },
]

export default function AutomationsPageDesktop({ onEdit }) {
  const { t }    = useTranslation('automations')

  const { data: automations = [], isLoading, isError } = useAutomations()
  const { importFlow } = useAutomationMutations()

  const [tab, setTab]               = useState('automations')
  const [createOpen, setCreateOpen] = useState(false)
  const importRef                   = useRef(null)

  const handleCreated = (automation) => onEdit(automation)

  const handleImportClick = () => importRef.current?.click()

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await importFlow.mutateAsync(file)
      onEdit(result)
    } catch {
      // error silencioso — se puede mejorar con toast
    }
    e.target.value = ''
  }

  return (
    <div style={{
      margin: '-32px',
      height: 'calc(100vh - 52px)',
      display: 'flex', flexDirection: 'column',
      background: '#fafafa',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        background: '#fff',
        borderBottom: '1px solid #f0f0f0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
            ⚡ {t('title')}
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 500,
                background: tab === key ? '#f3f4f6' : 'transparent',
                color:      tab === key ? '#111827' : '#6b7280',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'automations' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            <button onClick={handleImportClick} style={{
              padding: '7px 14px', borderRadius: 10,
              border: '1px solid #e5e7eb', background: '#fff',
              color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              ⬆️ {t('list.import')}
            </button>
            <button onClick={() => setCreateOpen(true)} style={{
              padding: '7px 16px', borderRadius: 10,
              border: 'none', background: '#0f172a',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              + {t('list.create')}
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* ── Tab: Automatizaciones ── */}
        {tab === 'automations' && (<>
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>Cargando...</span>
            </div>
          )}
          {isError && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <span style={{ fontSize: 13, color: '#ef4444' }}>{t('error.loadFailed')}</span>
            </div>
          )}
          {!isLoading && !isError && automations.length === 0 && (
            <AutomationEmptyState onCreateClick={() => setCreateOpen(true)} />
          )}
          {!isLoading && !isError && automations.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
              gap: 12, maxWidth: 1200,
            }}>
              {automations.map((a) => (
                <AutomationCard key={a.id} automation={a} onEdit={onEdit} />
              ))}
            </div>
          )}
        </>)}

        {/* ── Tab: API Keys ── */}
        {tab === 'apikeys' && <ApiKeysManager />}
      </div>

      <CreateAutomationModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}