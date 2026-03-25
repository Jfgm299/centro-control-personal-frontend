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
    <div
      className="absolute bottom-0 left-[220px] right-[280px] h-[220px] z-50 flex flex-col"
      style={{ background: 'rgba(10,12,20,0.85)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -4px 30px rgba(0,0,0,0.4)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 flex-shrink-0">
        <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          🕓 {t('editor.historyTitle')}
        </span>
        <div className="flex items-center gap-2">
          {selectedId && (
            <button
              onClick={() => { clearExecutionState(); setSelectedId(null) }}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-medium bg-transparent border-none cursor-pointer transition-colors"
            >
              {t('execution.backToAll')}
            </button>
          )}
          <button
            onClick={handleClose}
            className="bg-black/20 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white rounded-lg p-1 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-5 text-center text-white/30 text-xs">
            {t('status.loading')}
          </div>
        )}

        {!isLoading && executions.length === 0 && (
          <div className="p-5 text-center text-white/30 text-xs">
            {t('editor.noHistory')}
          </div>
        )}

        {!isLoading && executions.length > 0 && (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {['date', 'trigger', 'duration', 'status', 'failedNode'].map(col => (
                  <th
                    key={col}
                    className="bg-white/5 text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3 border-b border-white/10 text-left"
                  >
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
                  className={`cursor-pointer border-b border-white/8 last:border-0 transition-colors ${selectedId === ex.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <td className="px-4 py-3 text-white/70 text-sm">
                    {formatDate(ex.created_at)}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-sm">
                    {ex.trigger_type ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-sm">
                    {ex.duration_ms != null ? `${ex.duration_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ex.status} t={t} />
                  </td>
                  <td className="px-4 py-3 text-red-400/70 text-xs">
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
  const classes = {
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/20',
    success:   'bg-emerald-500/15 text-emerald-400 border-emerald-400/20',
    failed:    'bg-red-500/15 text-red-400 border-red-400/20',
    running:   'bg-blue-500/15 text-blue-400 border-blue-400/20',
    cancelled: 'bg-white/8 text-white/40 border-white/10',
  }
  const cls = classes[status] ?? classes.cancelled
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {t(`execution.status.${status}`) ?? status}
    </span>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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
