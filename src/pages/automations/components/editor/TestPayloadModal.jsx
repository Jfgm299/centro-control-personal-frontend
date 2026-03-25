import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Modal que aparece al pulsar "Ejecutar" en la toolbar.
 * Permite editar el payload JSON antes de lanzar la ejecución.
 *
 * Props:
 *   isOpen       — bool
 *   onClose      — () => void
 *   onRun        — (payload: object) => void
 *   isRunning    — bool
 *   triggerType  — string — para generar el payload de ejemplo
 */
export default function TestPayloadModal({ isOpen, onClose, onRun, isRunning, triggerType }) {
  const { t } = useTranslation('automations')

  const [raw, setRaw]       = useState('')
  const [error, setError]   = useState(null)

  // Inicializar con payload de ejemplo según el tipo de trigger
  useEffect(() => {
    if (isOpen) {
      setRaw(JSON.stringify(examplePayload(triggerType), null, 2))
      setError(null)
    }
  }, [isOpen, triggerType])

  if (!isOpen) return null

  const handleRun = () => {
    try {
      const parsed = JSON.parse(raw)
      setError(null)
      onRun(parsed)
    } catch {
      setError(t('testPayload.invalid'))
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg m-0">
              {t('testPayload.title')}
            </h2>
            <p className="text-white/40 text-xs mt-0.5 mb-0">
              {t('testPayload.description')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-black/20 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg p-1.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* JSON Editor */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <textarea
            value={raw}
            onChange={e => { setRaw(e.target.value); setError(null) }}
            spellCheck={false}
            className={`w-full px-4 py-3 text-sm bg-black/20 border rounded-xl text-white/85 placeholder-white/30 focus:outline-none focus:ring-1 transition-all resize-y min-h-[220px] font-mono ${error ? 'border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20' : 'border-white/10 focus:border-white/30 focus:ring-white/20'}`}
            style={{ fontFamily: '"SF Mono","Fira Code",monospace', fontSize: 12, lineHeight: 1.6 }}
          />
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white rounded-xl px-4 py-2.5 text-sm transition-all"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 ${isRunning ? 'bg-white/10 border border-white/10 text-white/30 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'}`}
          >
            {isRunning ? (
              <><Spinner />{t('testPayload.running')}</>
            ) : (
              `▶ ${t('testPayload.runNow')}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function examplePayload(triggerType) {
  const base = {
    'system.manual':            {},
    'system.schedule_once':     { scheduled_at: new Date().toISOString() },
    'system.schedule_interval': { tick: 1, triggered_at: new Date().toISOString() },
    'system.webhook_inbound':   { source: 'test', data: { key: 'value' } },
    'calendar_tracker.event_started': {
      event_id: 1, title: 'Reunión de equipo',
      start_at: new Date().toISOString(),
    },
    'calendar_tracker.event_ended': {
      event_id: 1, title: 'Reunión de equipo',
      end_at: new Date().toISOString(),
    },
    'calendar_tracker.reminder_due': {
      reminder_id: 1, title: 'Llamar al médico',
      due_at: new Date().toISOString(),
    },
  }
  return base[triggerType] ?? {}
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 12, height: 12,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </span>
  )
}
