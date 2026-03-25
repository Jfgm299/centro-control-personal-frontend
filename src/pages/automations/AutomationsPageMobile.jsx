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
    <div
      className="bg-transparent min-h-screen pb-20"
      style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '16px 16px 12px',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-2xl">
            ⚡ {t('title')}
          </span>
          <div className="flex gap-2">
            <input
              ref={importRef} type="file" accept=".json"
              onChange={handleImportFile} style={{ display: 'none' }}
            />
            <button
              onClick={() => importRef.current?.click()}
              className="bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white rounded-xl px-3 py-2 text-xs transition-all"
            >
              {t('list.import')}
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-95"
            >
              + {t('list.create')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-3">

        {isLoading && (
          <div className="text-center pt-16">
            <span className="text-white/30 text-sm">{t('status.loading')}</span>
          </div>
        )}

        {isError && (
          <div className="text-center pt-16">
            <span className="text-red-400 text-sm">{t('error.loadFailed')}</span>
          </div>
        )}

        {!isLoading && !isError && automations.length === 0 && (
          <AutomationEmptyState onCreateClick={() => setCreateOpen(true)} />
        )}

        {!isLoading && !isError && automations.length > 0 && (
          <div className="flex flex-col gap-2.5">
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
