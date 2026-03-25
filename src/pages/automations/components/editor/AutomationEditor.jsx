import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  ReactFlow, Background, MiniMap, Controls,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useAutomation } from '../../hooks/useAutomations'
import { useAutomationMutations } from '../../hooks/useAutomationMutations'
import { useFlowEditor }       from '../../hooks/useFlowEditor'
import { useAutomationsStore } from '../../store/editorStore'
import { nodeTypes, edgeTypes, refIdToNodeType } from './nodeTypes'

import EditorToolbar      from './EditorToolbar'
import NodeSidebar        from './NodeSidebar'
import NodeDetailsView    from './NodeDetailsView'
import TestPayloadModal   from './TestPayloadModal'
import ExecutionHistory   from './ExecutionHistory'

export default function AutomationEditor({ automationId, onClose }) {
  const id    = automationId
  const { t } = useTranslation('automations')
  const { screenToFlowPosition } = useReactFlow()

  // ── Store (granular para evitar re-renders innecesarios) ──────────────────
  const selectedNodeId         = useAutomationsStore(s => s.selectedNodeId)
  const setSelectedNodeId      = useAutomationsStore(s => s.setSelectedNodeId)
  const clearSelection         = useAutomationsStore(s => s.clearSelection)
  const isDirty                = useAutomationsStore(s => s.isDirty)
  const markClean              = useAutomationsStore(s => s.markClean)
  const editorName             = useAutomationsStore(s => s.editorName)
  const setEditorName          = useAutomationsStore(s => s.setEditorName)
  const setEditorNameSilent    = useAutomationsStore(s => s.setEditorNameSilent)
  const isExecuting            = useAutomationsStore(s => s.isExecuting)
  const testPayloadOpen        = useAutomationsStore(s => s.testPayloadOpen)
  const openTestPayload        = useAutomationsStore(s => s.openTestPayload)
  const closeTestPayload       = useAutomationsStore(s => s.closeTestPayload)
  const resetEditor            = useAutomationsStore(s => s.resetEditor)
  const [showHistory, setShowHistory] = useState(false)

  // ── Datos del backend ─────────────────────────────────────────────────────
  const { data: automation, isLoading } = useAutomation(id)
  const { updateFlow, updateMeta, toggleActive, trigger } = useAutomationMutations()
  const isSaving = updateFlow.isPending || updateMeta.isPending

  // ── Canvas ────────────────────────────────────────────────────────────────
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNodeAtPosition, updateNodeData,
    serializeFlow, loadFlow,
    undo, redo, canUndo, canRedo,
  } = useFlowEditor()

  // ── Cargar flujo al montar ────────────────────────────────────────────────
  useEffect(() => {
    if (!automation) return
    setEditorNameSilent(automation.name)
    if (automation.flow) loadFlow(automation.flow)
    markClean()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automation?.id])

  // ── Limpiar store al desmontar ────────────────────────────────────────────
  useEffect(() => () => resetEditor(), [resetEditor])

  // ── Atajos de teclado ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'z' &&  e.shiftKey) { e.preventDefault(); redo() }
      if (e.key === 'y')                { e.preventDefault(); redo() }
      if (e.key === 's')                { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  const contextVariables = buildContextVariables(automation?.trigger_type)

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!isDirty) return
    const flow = serializeFlow()
    await updateFlow.mutateAsync({ id, flow, trigger_type: getTriggerType(nodes) })
    if (editorName !== automation?.name) {
      await updateMeta.mutateAsync({ id, name: editorName })
    }
    markClean()
  }, [id, isDirty, editorName, automation?.name, nodes, serializeFlow, updateFlow, updateMeta, markClean])

  // ── Ejecutar ──────────────────────────────────────────────────────────────
  const handleRun = () => openTestPayload()

  const handleConfirmRun = useCallback(async (payload) => {
    closeTestPayload()

    const store = useAutomationsStore.getState()
    store.clearExecutionState()
    store.clearNodeOutputData()
    store.setIsExecuting(true)

    try {
      const baseUrl  = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const token    = localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token') ?? ''
      const response = await fetch(`${baseUrl}/api/v1/automations/${id}/trigger/stream`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload ?? {}),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''
      let   lastOutput = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let event
          try { event = JSON.parse(line.slice(6)) } catch (err) { continue }

          if (event.type === 'node_start') {
            flushSync(() => store.setNodeExecutionState(event.node_id, { status: 'running' }))

          } else if (event.type === 'node') {
            const input = lastOutput
            flushSync(() => {
              store.setNodeExecutionState(event.node_id, {
                status:      event.status,
                duration_ms: event.duration_ms,
                error:       event.error ?? null,
              })
              store.setNodeOutputData(event.node_id, {
                status:      event.status,
                duration_ms: event.duration_ms,
                error:       event.error ?? null,
                input,
                output: event.output ?? null,
              })
            })
            lastOutput = event.output ?? null

          } else if (event.type === 'done') {
            const logs       = event.node_logs ?? []
            const failedLog  = logs.find(l => l.status === 'failed')
            const loggedIds  = new Set(logs.map(l => l.node_id))
            nodes.forEach(n => { if (!loggedIds.has(n.id)) store.setNodeExecutionState(n.id, null) })
            store.setLastExecutionResult({
              status:         event.status,
              duration_ms:    event.duration_ms,
              error_message:  failedLog?.error ?? event.error_message ?? null,
              failed_node_id: failedLog?.node_id ?? null,
            })
          }
        }
      }
    } catch (err) {
      console.error('Execution error:', err)
      nodes.forEach(n => store.setNodeExecutionState(n.id, null))
    } finally {
      store.setIsExecuting(false)
    }
  }, [id, nodes, closeTestPayload])

  // ── Volver ────────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (isDirty && !window.confirm(t('editor.backConfirm'))) return
    onClose()
  }

  const handleToggleActive = (val) => toggleActive.mutate({ id, is_active: val })

  // ── Node click ────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id)
  }, [setSelectedNodeId])

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/xyflow-node')
    if (!raw) return
    let item
    try { item = JSON.parse(raw) } catch (err) { return }
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const nodeType = item.type ?? refIdToNodeType(item.ref_id, item.nodeCategory === 'action')
    addNodeAtPosition(nodeType, {
      label:         item.label,
      ref_id:        item.ref_id,
      icon:          item.icon,
      config_schema: item.config_schema ?? {},
    }, position)
  }, [screenToFlowPosition, addNodeAtPosition])

  const onPaneClick = useCallback(() => clearSelection(), [clearSelection])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={fullscreenStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>{t('status.loading')}</span>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={fullscreenStyle}>

      <EditorToolbar
        isActive={automation?.is_active ?? false}
        onBack={handleBack}
        onSave={handleSave}
        onRun={handleRun}
        onToggleActive={handleToggleActive}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        isSaving={isSaving}
        isDirty={isDirty}
        editorName={editorName}
        onNameChange={setEditorName}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(v => !v)}
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>

        {/* CANVAS VIEW — hidden when a node is selected for editing */}
        <div style={{
          display: selectedNodeId ? 'none' : 'flex',
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}>
          <NodeSidebar />
          <div style={{ flex: 1, position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onPaneClick={onPaneClick}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              deleteKeyCode={['Delete', 'Backspace']}
              minZoom={0.2}
              maxZoom={2}
            >
              <Background variant="dots" gap={16} size={1} color="rgba(255,255,255,0.08)" />
              <MiniMap
                nodeStrokeWidth={2}
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
              />
              <Controls style={{ borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }} />
            </ReactFlow>
          </div>

          <ExecutionHistory
            automationId={id}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
        </div>

        {/* NDV — shown when a node is selected, replaces canvas */}
        {selectedNodeId && (
          <NodeDetailsView
            nodeId={selectedNodeId}
            nodes={nodes}
            edges={edges}
            onClose={() => clearSelection()}
            onExecuteStep={() => openTestPayload()}
            onUpdateNode={updateNodeData}
            onDeleteNode={(nodeId) => onNodesChange([{ type: 'remove', id: nodeId }])}
            variables={contextVariables}
            automationId={id}
          />
        )}

      </div>

      <TestPayloadModal
        isOpen={testPayloadOpen}
        onClose={closeTestPayload}
        onRun={handleConfirmRun}
        isRunning={isExecuting}
        triggerType={automation?.trigger_type}
      />
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const fullscreenStyle = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(40px)',
  display: 'flex', flexDirection: 'column',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
}

// ── Utilidades ────────────────────────────────────────────────────────────────

function getTriggerType(nodes) {
  const trigger = nodes.find(n => n.type === 'trigger' || n.type === 'webhook_inbound')
  const refId   = trigger?.data?.config?.trigger_id ?? trigger?.data?.ref_id ?? ''
  if (refId.includes('webhook'))                             return 'webhook'
  if (refId.includes('schedule') || refId.includes('cron')) return 'cron'
  return 'module_event'
}

function buildContextVariables(triggerType) {
  const base = [
    { path: 'payload.triggered_at', type: 'string', label: 'Hora de activación' },
  ]
  const byType = {
    'calendar_tracker.event_started': [
      { path: 'payload.event_id', type: 'number', label: 'ID del evento' },
      { path: 'payload.title',    type: 'string', label: 'Título del evento' },
      { path: 'payload.start_at', type: 'string', label: 'Hora de inicio' },
    ],
    'calendar_tracker.event_ended': [
      { path: 'payload.event_id', type: 'number', label: 'ID del evento' },
      { path: 'payload.title',    type: 'string', label: 'Título del evento' },
      { path: 'payload.end_at',   type: 'string', label: 'Hora de fin' },
    ],
    'calendar_tracker.reminder_due': [
      { path: 'payload.reminder_id', type: 'number', label: 'ID del recordatorio' },
      { path: 'payload.title',       type: 'string', label: 'Título' },
      { path: 'payload.due_at',      type: 'string', label: 'Hora de vencimiento' },
    ],
    'system.webhook_inbound': [
      { path: 'payload.data',   type: 'object', label: 'Body del webhook' },
      { path: 'payload.source', type: 'string', label: 'Fuente' },
    ],
  }
  return [...base, ...(byType[triggerType] ?? [])]
}