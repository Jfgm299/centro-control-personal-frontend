import { useCallback, useRef } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import { useAutomationsStore } from '../store/editorStore'

const MAX_HISTORY = 50

/**
 * Gestiona el estado del canvas de xyflow con undo/redo manual.
 *
 * Separa la lógica del canvas del componente AutomationEditor
 * para mantener el componente limpio.
 */
export function useFlowEditor(initialNodes = [], initialEdges = []) {
  const { setDirty, setSelectedNodeId } = useAutomationsStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Historial para undo/redo
  const historyRef  = useRef([])
  const futureRef   = useRef([])
  const snapshotRef = useRef(null)

  // ── Snapshot helpers ──────────────────────────────────────────────────────

  const takeSnapshot = useCallback(() => {
    snapshotRef.current = {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
    }
  }, [nodes, edges])

  const pushHistory = useCallback(() => {
    if (!snapshotRef.current) return
    historyRef.current = [
      ...historyRef.current.slice(-MAX_HISTORY + 1),
      snapshotRef.current,
    ]
    futureRef.current = []
    snapshotRef.current = null
  }, [])

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    const history = historyRef.current
    if (!history.length) return

    const prev    = history[history.length - 1]
    const current = { nodes: [...nodes], edges: [...edges] }

    historyRef.current = history.slice(0, -1)
    futureRef.current  = [current, ...futureRef.current]

    setNodes(prev.nodes)
    setEdges(prev.edges)
    setDirty(true)
  }, [nodes, edges, setNodes, setEdges, setDirty])

  const redo = useCallback(() => {
    const future = futureRef.current
    if (!future.length) return

    const next    = future[0]
    const current = { nodes: [...nodes], edges: [...edges] }

    futureRef.current  = future.slice(1)
    historyRef.current = [...historyRef.current, current]

    setNodes(next.nodes)
    setEdges(next.edges)
    setDirty(true)
  }, [nodes, edges, setNodes, setEdges, setDirty])

  const canUndo = historyRef.current.length > 0
  const canRedo = futureRef.current.length  > 0

  // ── Node changes ──────────────────────────────────────────────────────────

  const handleNodesChange = useCallback((changes) => {
    // Solo guardar snapshot antes de cambios destructivos
    const hasPositionChange = changes.some((c) => c.type === 'position' && c.dragging === false)
    const hasRemove         = changes.some((c) => c.type === 'remove')

    if (hasPositionChange || hasRemove) {
      takeSnapshot()
      pushHistory()
    }

    onNodesChange(changes)

    if (hasRemove) {
      setSelectedNodeId(null)
      setDirty(true)
    }
  }, [onNodesChange, takeSnapshot, pushHistory, setSelectedNodeId, setDirty])

  // ── Edge changes ──────────────────────────────────────────────────────────

  const handleEdgesChange = useCallback((changes) => {
    const hasRemove = changes.some((c) => c.type === 'remove')
    if (hasRemove) {
      takeSnapshot()
      pushHistory()
    }
    onEdgesChange(changes)
    if (hasRemove) setDirty(true)
  }, [onEdgesChange, takeSnapshot, pushHistory, setDirty])

  // ── Connect ───────────────────────────────────────────────────────────────

  const onConnect = useCallback((connection) => {
    takeSnapshot()
    pushHistory()

    // Determinar si el source handle es 'true' o 'false' (para condiciones)
    const when = connection.sourceHandle === 'true'  ? 'true'
               : connection.sourceHandle === 'false' ? 'false'
               : null

    setEdges((eds) =>
      addEdge({
        ...connection,
        type: when ? 'condition' : 'default',
        data: { when },
      }, eds)
    )
    setDirty(true)
  }, [takeSnapshot, pushHistory, setEdges, setDirty])

  // ── Drop nodo desde sidebar ───────────────────────────────────────────────

  const addNodeAtPosition = useCallback((nodeType, nodeData, position) => {
    takeSnapshot()
    pushHistory()

    const newNode = {
      id:       `${nodeType}_${Date.now()}`,
      type:     nodeType,
      position,
      data:     {
        label:  nodeData.label,
        ref_id: nodeData.ref_id ?? null,
        config: {},
        continue_on_error: false,
        ...nodeData,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedNodeId(newNode.id)
    setDirty(true)

    return newNode
  }, [takeSnapshot, pushHistory, setNodes, setSelectedNodeId, setDirty])

  // ── Update nodo config (desde el panel derecho) ───────────────────────────

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...newData } }
          : n
      )
    )
    setDirty(true)
  }, [setNodes, setDirty])

  // ── Serialización para guardar ────────────────────────────────────────────

  const serializeFlow = useCallback(() => ({
    nodes: nodes.map((n) => {
      const config = { ...(n.data.config ?? {}) }

      // Asegurar que ref_id queda en el campo correcto según tipo de nodo
      const refId = n.data.ref_id ?? null
      if (refId) {
        if (n.type === 'trigger' || n.type === 'webhook_inbound') {
          config.trigger_id = refId
        } else if (n.type === 'action') {
          config.action_id = refId
        }
      }

      config._pos    = n.position                    // posición — Pydantic la preserva
      config._label  = n.data.label        ?? null  // nombre visible del nodo
      config._icon   = n.data.icon         ?? null  // icono
      config._schema = n.data.config_schema ?? null  // schema para el config panel

      return {
        id:   n.id,
        type: n.type,
        config,
        continue_on_error: n.data.continue_on_error ?? false,
      }
    }),
    edges: edges.map((e) => ({
      from: e.source,
      to:   e.target,
      when: e.data?.when ?? null,
    })),
  }), [nodes, edges])

  // ── Carga de flujo existente ───────────────────────────────────────────────

  const loadFlow = useCallback((flow) => {
    const loadedNodes = (flow.nodes ?? []).map((n) => {
      const config        = { ...(n.config ?? {}) }
      const position      = config._pos    ?? { x: 250, y: 100 }
      const label         = config._label  ?? config.label ?? n.type
      const icon          = config._icon   ?? null
      const config_schema = config._schema ?? null
      delete config._pos
      delete config._label
      delete config._icon
      delete config._schema

      return {
        id:       n.id,
        type:     n.type,
        position,
        data: {
          config,
          continue_on_error: n.continue_on_error ?? false,
          ref_id: config.trigger_id ?? config.action_id ?? null,
          label,
          icon,
          config_schema,
        },
      }
    })

    const loadedEdges = (flow.edges ?? []).map((e, i) => ({
      id:     `e_${i}`,
      source: e.from,
      target: e.to,
      type:   e.when ? 'condition' : 'default',
      data:   { when: e.when },
    }))

    setNodes(loadedNodes)
    setEdges(loadedEdges)
    historyRef.current = []
    futureRef.current  = []
  }, [setNodes, setEdges])

  return {
    nodes,
    edges,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect,
    addNodeAtPosition,
    updateNodeData,
    serializeFlow,
    loadFlow,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}