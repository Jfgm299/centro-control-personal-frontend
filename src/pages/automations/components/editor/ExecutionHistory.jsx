import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationExecutions } from '../../hooks/useAutomations'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * Panel de historial de ejecuciones dentro del editor.
 * Toggle con botón en la toolbar (pasado como prop showHistory/onToggle).
 *
 * Al hacer click en una ejecución, carga el estado de los nodos
 * en el store para visualizarlos en el canvas (modo revisión).
 */
export default function ExecutionHistory({ automationId, isOpen, onClose }) {
  const { t } = useTranslation('automations')
  const { data: executions = [], isLoading } = useAutomationExecutions(automationId)
  const { setNodeExecutionState, clearExecutionState } = useAutomationsStore()

  const [selectedId, setSelectedId] = useState(null)

  if (!isOpen) return null

  const handleSelectExecution = (execution) => {
    setSelectedId(execution.id)
    clearExecutionState()

    // Carga los estados de los nodos de esa ejecución en el canvas
    for (const log of execution.node_logs ?? []) {
      setNodeExecutionState(log.node_id, {
        status:      log.status,
        duration_ms: log.duration_ms,
        error:       log.error ?? null,
      })
    }
  }

  const handleClose = () => {
    clearExecutionState()
    setSelectedId(null)
    onClose()
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 220, right: 280,
      height: 220, zIndex: 50,
      background: '#fff',
      borderTop: '1px solid #f0f0f0',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid #f0f0f0', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
          🕓 {t('editor.historyTitle')}
        </span>
        {selectedId && (
          <button onClick={() => { clearExecutionState(); setSelectedId(null) }} style={linkBtn}>
            ← Volver a todas
          </button>
        )}
        <button onClick={handleClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
          ×
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
            Cargando...
          </div>
        )}

        {!isLoading && executions.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
            {t('editor.noHistory')}
          </div>
        )}

        {!isLoading && executions.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['date', 'trigger', 'duration', 'status', 'failedNode'].map(col => (
                  <th key={col} style={{
                    padding: '6px 14px', textAlign: 'left',
                    fontSize: 10, fontWeight: 700, color: '#9ca3af',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid #f0f0f0',
                  }}>
                    {t(`execution.columns.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {executions.map((ex) => (
                <tr
                  key={ex.id}
                  onClick={() => handleSelectExecution(ex)}
                  style={{
                    cursor: 'pointer',
                    background: selectedId === ex.id ? '#f0f9ff' : 'transparent',
                    borderBottom: '1px solid #f9fafb',
                  }}
                  onMouseEnter={e => { if (selectedId !== ex.id) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={e => { if (selectedId !== ex.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '7px 14px', color: '#374151' }}>
                    {formatDate(ex.created_at)}
                  </td>
                  <td style={{ padding: '7px 14px', color: '#6b7280' }}>
                    {ex.trigger_type ?? '—'}
                  </td>
                  <td style={{ padding: '7px 14px', color: '#6b7280' }}>
                    {ex.duration_ms != null ? `${ex.duration_ms}ms` : '—'}
                  </td>
                  <td style={{ padding: '7px 14px' }}>
                    <StatusBadge status={ex.status} t={t} />
                  </td>
                  <td style={{ padding: '7px 14px', color: '#ef4444', fontSize: 11 }}>
                    {ex.error_message ? truncate(ex.error_message, 40) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status, t }) {
  const colors = {
    completed: { bg: '#dcfce7', color: '#15803d' },
    failed:    { bg: '#fee2e2', color: '#dc2626' },
    running:   { bg: '#dbeafe', color: '#1d4ed8' },
    cancelled: { bg: '#f3f4f6', color: '#6b7280' },
  }
  const c = colors[status] ?? colors.cancelled
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px',
      borderRadius: 6, background: c.bg, color: c.color,
    }}>
      {t(`execution.status.${status}`) ?? status}
    </span>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const linkBtn = {
  border: 'none', background: 'none', cursor: 'pointer',
  fontSize: 11, color: '#6366f1', fontWeight: 500, padding: 0,
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str
}