import { create } from 'zustand'

// ── Utility: upstream node lookup ─────────────────────────────────────────────

/**
 * Returns the id of the upstream (source) node connected to nodeId.
 * Finds the first edge where edge.target === nodeId and returns edge.source.
 */
export function getPrevNodeId(nodeId, nodes, edges) {
  if (!nodeId || !edges) return null
  const incoming = edges.find(e => e.target === nodeId)
  if (!incoming) return null
  return incoming.source
}

// ─────────────────────────────────────────────────────────────────────────────

export const useAutomationsStore = create((set, get) => ({

  // ── Editor: estado del canvas ─────────────────────────────────────────────

  /** Nodo seleccionado actualmente (abre el config panel derecho) */
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  clearSelection:    ()   => set({ selectedNodeId: null }),

  /** Flag: hay cambios sin guardar en el editor */
  isDirty: false,
  setDirty:  (v) => set({ isDirty: v }),
  markClean: ()  => set({ isDirty: false }),

  /** Guarda nombre editable en la toolbar */
  editorName: '',
  setEditorName:       (name) => set({ editorName: name, isDirty: true }),
  setEditorNameSilent: (name) => set({ editorName: name }),

  // ── Ejecución en tiempo real ───────────────────────────────────────────────

  /**
   * Estado visual por nodo: { status, duration_ms, error }
   */
  executionState: {},
  setNodeExecutionState: (nodeId, state) =>
    set((s) => {
      const next = { ...s.executionState }
      if (state === null) delete next[nodeId]
      else next[nodeId] = state
      return { executionState: next }
    }),
  clearExecutionState: () => set({ executionState: {} }),

  /**
   * Input/output de cada nodo tras una ejecución.
   * nodeId → { input: dict, output: dict, status, duration_ms, error }
   */
  nodeOutputData: {},
  setNodeOutputData: (nodeId, data) =>
    set((s) => ({
      nodeOutputData: { ...s.nodeOutputData, [nodeId]: data },
    })),
  clearNodeOutputData: () => set({ nodeOutputData: {} }),

  /** Nodo cuyo panel de output está abierto (click post-ejecución) */
  viewingOutputNodeId: null,
  setViewingOutputNodeId: (id) => set({ viewingOutputNodeId: id }),

  /** ID de la ejecución en curso (para polling) */
  activeExecutionId: null,
  setActiveExecutionId: (id) => set({ activeExecutionId: id }),

  /** true mientras hay polling activo */
  isExecuting: false,
  setIsExecuting: (v) => set({ isExecuting: v }),

  /** Resultado final de la última ejecución */
  lastExecutionResult: null,   // { status: 'completed'|'failed', duration_ms, error_message }
  setLastExecutionResult: (r) => set({ lastExecutionResult: r }),
  clearLastExecutionResult: () => set({ lastExecutionResult: null }),

  // ── Test Payload Modal ─────────────────────────────────────────────────────

  testPayloadOpen: false,
  openTestPayload:  () => set({ testPayloadOpen: true }),
  closeTestPayload: () => set({ testPayloadOpen: false }),

  // ── Sidebar panel izquierdo ───────────────────────────────────────────────

  /** Texto del buscador de nodos en la sidebar */
  sidebarSearch: '',
  setSidebarSearch: (v) => set({ sidebarSearch: v }),

  /** Secciones colapsadas en la sidebar: Set de section keys */
  collapsedSections: new Set(),
  toggleSection: (key) =>
    set((s) => {
      const next = new Set(s.collapsedSections)
      next.has(key) ? next.delete(key) : next.add(key)
      return { collapsedSections: next }
    }),

  // ── Variable Picker ────────────────────────────────────────────────────────

  /** Campo target donde se insertará la variable seleccionada */
  variablePickerTarget: null,   // { fieldId, onInsert: (varPath) => void }
  openVariablePicker:  (target) => set({ variablePickerTarget: target }),
  closeVariablePicker: ()       => set({ variablePickerTarget: null }),

  // ── Floating Panels (n8n-style) ────────────────────────────────────────────

  /** Shared z-index counter — increments when any panel gains focus */
  panelZIndexCounter: 100,

  /**
   * Panel states by ID
   * @type {Record<string, { open: boolean, collapsed: boolean, position: {x,y}, size: {w,h}, zIndex: number }>}
   */
  panels: {
    nodePicker:       { open: false, collapsed: false, position: { x: 16, y: 16 },   size: { w: 240, h: 500 }, zIndex: 100 },
    ndv:              { open: false, collapsed: false, position: { x: Math.round(window.innerWidth * 0.05), y: Math.round(window.innerHeight * 0.1) }, size: { w: Math.round(window.innerWidth * 0.88), h: Math.round(window.innerHeight * 0.78) }, zIndex: 101 },
    inputPreview:     { open: false, collapsed: false, position: null,               size: { w: 220, h: 200 }, zIndex: 102 },
    outputPreview:    { open: false, collapsed: false, position: null,               size: { w: 220, h: 200 }, zIndex: 103 },
    executionHistory: { open: false, collapsed: false, position: { x: null, y: 16 }, size: { w: 320, h: 400 }, zIndex: 104 },
  },

  openPanel: (panelId) => set((s) => ({
    panels: { ...s.panels, [panelId]: { ...s.panels[panelId], open: true } },
  })),

  closePanel: (panelId) => set((s) => ({
    panels: { ...s.panels, [panelId]: { ...s.panels[panelId], open: false } },
  })),

  togglePanel: (panelId) => set((s) => ({
    panels: { ...s.panels, [panelId]: { ...s.panels[panelId], open: !s.panels[panelId]?.open } },
  })),

  togglePanelCollapse: (panelId) => set((s) => ({
    panels: { ...s.panels, [panelId]: { ...s.panels[panelId], collapsed: !s.panels[panelId]?.collapsed } },
  })),

  setPanelPosition: (panelId, position) => set((s) => ({
    panels: { ...s.panels, [panelId]: { ...s.panels[panelId], position } },
  })),

  setPanelSize: (panelId, size) => set((s) => ({
    panels: { ...s.panels, [panelId]: { ...s.panels[panelId], size } },
  })),

  bringPanelToFront: (panelId) => set((s) => {
    const next = s.panelZIndexCounter + 1
    return {
      panelZIndexCounter: next,
      panels: { ...s.panels, [panelId]: { ...s.panels[panelId], zIndex: next } },
    }
  }),

  // ── Helpers compuestos ─────────────────────────────────────────────────────

  resetEditor: () => set({
    selectedNodeId:       null,
    isDirty:              false,
    editorName:           '',
    executionState:       {},
    nodeOutputData:       {},
    viewingOutputNodeId:  null,
    activeExecutionId:    null,
    isExecuting:          false,
    lastExecutionResult:  null,
    testPayloadOpen:      false,
    sidebarSearch:        '',
    variablePickerTarget: null,
    // Reset panels to default state
    panelZIndexCounter:   100,
    panels: {
      nodePicker:       { open: false, collapsed: false, position: { x: 16, y: 16 },   size: { w: 240, h: 500 }, zIndex: 100 },
      ndv:              { open: false, collapsed: false, position: { x: Math.round(window.innerWidth * 0.05), y: Math.round(window.innerHeight * 0.1) }, size: { w: Math.round(window.innerWidth * 0.88), h: Math.round(window.innerHeight * 0.78) }, zIndex: 101 },
      inputPreview:     { open: false, collapsed: false, position: null,               size: { w: 220, h: 200 }, zIndex: 102 },
      outputPreview:    { open: false, collapsed: false, position: null,               size: { w: 220, h: 200 }, zIndex: 103 },
      executionHistory: { open: false, collapsed: false, position: { x: null, y: 16 }, size: { w: 320, h: 400 }, zIndex: 104 },
    },
  }),
}))