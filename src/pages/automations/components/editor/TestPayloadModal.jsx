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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '80vh',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
              {t('testPayload.title')}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
              {t('testPayload.description')}
            </p>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 20, color: '#9ca3af', lineHeight: 1, padding: 0,
          }}>
            ×
          </button>
        </div>

        {/* JSON Editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          <textarea
            value={raw}
            onChange={e => { setRaw(e.target.value); setError(null) }}
            spellCheck={false}
            style={{
              width: '100%', boxSizing: 'border-box',
              minHeight: 220, padding: '10px 12px',
              fontFamily: '"SF Mono","Fira Code",monospace',
              fontSize: 12, lineHeight: 1.6,
              border: `1px solid ${error ? '#fca5a5' : '#e5e7eb'}`,
              borderRadius: 10, outline: 'none',
              color: '#111827', resize: 'vertical',
              background: '#fafafa',
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 10,
            border: '1px solid #e5e7eb', background: '#fff',
            color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            style={{
              padding: '8px 20px', borderRadius: 10,
              border: 'none',
              background: isRunning ? '#9ca3af' : '#0f172a',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
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