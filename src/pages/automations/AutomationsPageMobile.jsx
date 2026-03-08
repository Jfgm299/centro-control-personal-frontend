import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomations } from './hooks/useAutomations'
import { useAutomationMutations } from './hooks/useAutomationMutations'
import AutomationCard        from './components/list/AutomationCard'
import AutomationEmptyState  from './components/list/AutomationEmptyState'
import CreateAutomationModal from './components/list/CreateAutomationModal'

export default function AutomationsPageMobile({ onEdit }) {
  const { t }    = useTranslation('automations')

  const { data: automations = [], isLoading, isError } = useAutomations()
  const { importFlow } = useAutomationMutations()

  const [createOpen, setCreateOpen] = useState(false)
  const importRef = useRef(null)

  // En móvil, editar redirige al editor desktop con aviso al llegar
  const handleCreated = (automation) => onEdit(automation)

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importFlow.mutateAsync(file)
    } catch { /* silent */ }
    e.target.value = ''
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      paddingBottom: 80,
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '16px 16px 12px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
            ⚡ {t('title')}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={importRef} type="file" accept=".json"
              onChange={handleImportFile} style={{ display: 'none' }}
            />
            <button
              onClick={() => importRef.current?.click()}
              style={{
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid #e5e7eb', background: '#fff',
                fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer',
              }}
            >
              {t('list.import')}
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                border: 'none', background: '#0f172a',
                color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              + {t('list.create')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 12px 0' }}>

        {isLoading && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {automations.map((a) => (
              <AutomationCard
                key={a.id}
                automation={a}
                onEdit={onEdit}
                isMobile
              />
            ))}
          </div>
        )}
      </div>

      <CreateAutomationModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}