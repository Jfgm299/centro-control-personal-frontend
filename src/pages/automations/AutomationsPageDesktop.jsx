import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomations } from './hooks/useAutomations'
import { useAutomationMutations } from './hooks/useAutomationMutations'
import AutomationCard          from './components/list/AutomationCard'
import AutomationEmptyState    from './components/list/AutomationEmptyState'
import CreateAutomationModal   from './components/list/CreateAutomationModal'
import ApiKeysManager          from './components/list/ApiKeysManager'

export default function AutomationsPageDesktop({ onEdit }) {
  const { t }    = useTranslation('automations')

  const TABS = [
    { key: 'automations', label: `⚡ ${t('title')}` },
    { key: 'apikeys',     label: `🔑 ${t('apiKeys.title')}` },
  ]

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
    <div
      className="bg-transparent flex flex-col"
      style={{
        margin: '-32px',
        height: 'calc(100vh - 52px)',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '0 24px', height: 56,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-2xl">
            ⚡ {t('title')}
          </span>
          <div className="flex gap-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${tab === key ? 'bg-white/15 border-white/20 text-white' : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:bg-white/8'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'automations' && (
          <div className="flex gap-2">
            <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            <button
              onClick={handleImportClick}
              className="bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white rounded-xl px-4 py-2.5 text-sm transition-all"
            >
              ⬆️ {t('list.import')}
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95"
            >
              + {t('list.create')}
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 24 }}>

        {/* ── Tab: Automatizaciones ── */}
        {tab === 'automations' && (<>
          {isLoading && (
            <div className="flex justify-center pt-16">
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
