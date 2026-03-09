import { useEffect, useRef, useCallback } from 'react'
import { executionsService } from '../services/automationsApi'
import { useAutomationsStore } from '../store/editorStore'

const POLL_INTERVAL_MS  = 1000
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'success'])

export function useExecution() {
  const intervalRef = useRef(null)

  const {
    setActiveExecutionId,
    setIsExecuting,
    setNodeExecutionState,
    setNodeOutputData,
    clearExecutionState,
    clearNodeOutputData,
    setLastExecutionResult,
  } = useAutomationsStore()

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsExecuting(false)
  }, [setIsExecuting])

  const applyNodeLogs = useCallback((nodeLogs = [], triggerPayload = null) => {
    for (let i = 0; i < nodeLogs.length; i++) {
      const log = nodeLogs[i]

      // Estado visual
      setNodeExecutionState(log.node_id, {
        status:      log.status,
        duration_ms: log.duration_ms,
        error:       log.error ?? null,
      })

      // Input/output para el panel de detalle
      // El input de un nodo es el output del anterior (o el trigger_payload para el primero)
      const prevOutput = i === 0
        ? triggerPayload
        : (nodeLogs[i - 1]?.output ?? null)

      setNodeOutputData(log.node_id, {
        status:      log.status,
        duration_ms: log.duration_ms,
        error:       log.error ?? null,
        input:       prevOutput,
        output:      log.output ?? null,
      })
    }
  }, [setNodeExecutionState, setNodeOutputData])

  const startPolling = useCallback((executionId) => {
    if (!executionId) return

    clearExecutionState()
    clearNodeOutputData()
    setActiveExecutionId(executionId)
    setIsExecuting(true)
    setLastExecutionResult(null)

    intervalRef.current = setInterval(async () => {
      try {
        const execution = await executionsService.getById(executionId)

        if (execution.node_logs?.length) {
          applyNodeLogs(execution.node_logs, execution.trigger_payload)
        }

        if (TERMINAL_STATUSES.has(execution.status)) {
          applyNodeLogs(execution.node_logs ?? [], execution.trigger_payload)
          setLastExecutionResult({
            status:        execution.status,
            duration_ms:   execution.duration_ms,
            error_message: execution.error_message ?? null,
            trigger_payload: execution.trigger_payload,
          })
          stopPolling()
        }
      } catch (err) {
        console.error('[useExecution] polling error:', err)
        stopPolling()
      }
    }, POLL_INTERVAL_MS)
  }, [applyNodeLogs, clearExecutionState, clearNodeOutputData, setActiveExecutionId, setIsExecuting, setLastExecutionResult, stopPolling])

  useEffect(() => () => stopPolling(), [stopPolling])

  return { startPolling, stopPolling }
}