import { create } from 'zustand'

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
  }),
}))