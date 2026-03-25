# automations

id: `automations_engine` | Path: `/automations` | Mobile: ✅ | Desktop: ✅

Editor visual de flujos de automatización. Usa **XYFlow** (`@xyflow/react`) para el canvas de nodos y edges. Es el módulo más complejo del frontend.

> **🚧 Active Redesign:** Ver @docs/n8n-glass-redesign.md para el plan de rediseño estilo n8n.

## Structure

```
automations/
├── index.js
├── AutomationsPage.jsx         ← delega Mobile/Desktop
├── AutomationsPageDesktop.jsx
├── AutomationsPageMobile.jsx
├── components/
│   ├── config/
│   │   ├── NodeConfigPanel.jsx       ← panel de config del nodo (genérico + SPECIFIC_CONFIGS)
│   │   ├── ExpressionEditorModal.jsx ← editor de expresiones con syntax highlighting + variable browser
│   │   ├── ParameterPill.jsx         ← pill de variable draggable (drag source)
│   │   ├── VariablePicker.jsx        ← dropdown para insertar variables en campos
│   │   ├── ScheduleConfig.jsx        ← configs específicas: ScheduleOnceConfig, ScheduleIntervalConfig
│   │   └── WebhookConfig.jsx         ← configs específicas: WebhookInboundConfig, WebhookOutboundConfig
│   ├── edges/
│   │   ├── AnimatedEdge.jsx          ← edge con animación de ejecución (dash-offset)
│   │   ├── ConditionEdge.jsx         ← edge activo (n8n-style, con label true/false)
│   │   └── LegacyConditionEdge.jsx   ← edge original preservado para rollback
│   ├── editor/
│   │   ├── AutomationEditor.jsx      ← canvas XYFlow + paneles flotantes
│   │   ├── EditorToolbar.jsx         ← barra superior (nombre, save, test, run)
│   │   ├── InputDataPanel.jsx        ← panel columna izquierda del NDV (input del nodo)
│   │   ├── NodeOutputPanel.jsx       ← panel columna derecha del NDV (output del nodo)
│   │   ├── NodeSidebar.jsx           ← sidebar fijo (modo sin feature flags)
│   │   ├── NodeSidebarItem.jsx
│   │   ├── NodeSidebarSection.jsx
│   │   ├── TestPayloadModal.jsx      ← modal para payload de trigger manual
│   │   ├── LegacyNodeDetailsView.jsx ← NDV original preservado para rollback
│   │   ├── LegacyNodeSidebar.jsx     ← sidebar original preservado para rollback
│   │   └── nodeTypes.js              ← mapa nodeType → componente React (feature-flagged)
│   ├── list/       ← lista de automatizaciones
│   ├── nodes/
│   │   ├── N8nBaseNode.jsx           ← wrapper n8n con shapes por categoría
│   │   ├── N8nTriggerNode.jsx
│   │   ├── N8nActionNode.jsx
│   │   ├── N8nConditionNode.jsx
│   │   ├── N8nDelayNode.jsx
│   │   ├── N8nStopNode.jsx
│   │   ├── N8nOutboundWebhookNode.jsx
│   │   ├── N8nWebhookInboundNode.jsx
│   │   ├── LegacyTriggerNode.jsx     ← nodo original preservado para rollback
│   │   ├── LegacyActionNode.jsx
│   │   ├── LegacyConditionNode.jsx
│   │   ├── LegacyDelayNode.jsx
│   │   ├── LegacyStopNode.jsx
│   │   ├── LegacyOutboundWebhookNode.jsx
│   │   └── LegacyWebhookInboundNode.jsx
│   ├── panels/
│   │   ├── FloatingNDV.jsx           ← NDV flotante 3 columnas (INPUT | Parameters | OUTPUT)
│   │   ├── NodePickerPanel.jsx       ← selector de nodos flotante (reemplaza NodeSidebar)
│   │   ├── InputPreviewPanel.jsx     ← preview de input de un nodo (post-ejecución)
│   │   └── OutputPreviewPanel.jsx    ← preview de output de un nodo (post-ejecución)
│   └── ui/
│       ├── FloatingPanel.jsx         ← base draggable+resizable (framer-motion)
│       └── PanelHeader.jsx           ← header con drag handle, collapse, close
├── hooks/
│   ├── useAutomations.js             ← React Query: lista y detalle
│   ├── useAutomationMutations.js     ← create, update, delete, duplicate, trigger
│   ├── useRegistry.js                ← useRegistryTriggers + useRegistryActions (con i18n)
│   ├── useExecution.js               ← historial de ejecuciones + streaming
│   └── useFlowEditor.js              ← estado del editor XYFlow (nodes, edges, onConnect...)
├── services/
│   ├── api.js
│   └── automationsApi.js             ← automationsService, registryService, executionService, webhookService
├── store/
│   └── editorStore.js                ← estado completo del editor (ver State)
└── styles/
    ├── glass.css                     ← tokens CSS glass + utility classes
    ├── nodes.css                     ← shapes y estados de nodos n8n
    ├── panels.css                    ← estilos de paneles flotantes + NDV
    ├── edges.css                     ← animaciones de edges
    ├── config.css                    ← estilos de campos del NodeConfigPanel
    └── index.css                     ← barrel que importa todo (importado en main)
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['automations']` | Lista de automatizaciones |
| React Query `['automations', id]` | Detalle + flow completo |
| React Query `['automations', 'registry', 'triggers']` | Triggers disponibles (backend + SYSTEM_TRIGGERS) |
| React Query `['automations', 'registry', 'actions']` | Acciones disponibles del backend |
| React Query `['executions', id]` | Historial de ejecuciones |
| `useAutomationsStore` (Zustand) | Todo el estado del editor — ver slices abajo |
| `useFlowEditor` | Lógica de XYFlow: nodes, edges, handlers de conexión |

### `useAutomationsStore` — slices

| Slice | Para qué |
|-------|----------|
| `selectedNodeId` | Nodo seleccionado en el canvas |
| `isDirty / editorName` | Estado del nombre y cambios sin guardar |
| `executionState` | Estado visual por nodo durante ejecución `{ status, duration_ms, error }` |
| `nodeOutputData` | Input/output de cada nodo tras ejecución |
| `viewingOutputNodeId` | Nodo cuyo panel de output está abierto |
| `activeExecutionId / isExecuting / lastExecutionResult` | Polling y resultado de ejecución |
| `testPayloadOpen` | Modal de test payload |
| `sidebarSearch / collapsedSections` | Estado de la sidebar de nodos |
| `variablePickerTarget` | Campo target donde se insertará la variable seleccionada |
| `panels` | Estado de cada panel flotante: `{ open, collapsed, position: {x,y}, size: {w,h}, zIndex }` |
| `panelZIndexCounter` | Contador compartido para z-index de paneles (bring-to-front) |

Paneles registrados en `panels`: `nodePicker`, `ndv`, `inputPreview`, `outputPreview`, `executionHistory`.

Acciones de paneles: `openPanel`, `closePanel`, `togglePanel`, `togglePanelCollapse`, `setPanelPosition`, `setPanelSize`, `bringPanelToFront`.

## Key Behaviour

### Feature Flags

Definidos en `src/config/features.js`. Todos off por defecto (requieren `.env`).

| Variable de entorno | `FEATURES.*` | Qué habilita |
|---------------------|--------------|--------------|
| `VITE_ENABLE_N8N_STYLE=true` | `N8N_STYLE` | Master switch — habilita todos los flags `N8N_*` |
| `VITE_ENABLE_N8N_GLASS=true` | `N8N_STYLE` | Alias de compatibilidad para `N8N_STYLE` |
| `VITE_ENABLE_N8N_LAYOUT=true` | `N8N_LAYOUT` | Editor inline (tabs visibles); false = fullscreen overlay |
| `VITE_ENABLE_N8N_NODES=true` | `N8N_NODES` | Nodos estilo n8n (`N8n*Node`) en lugar de Legacy |
| `VITE_ENABLE_N8N_PANELS=true` | `N8N_PANELS` | Paneles flotantes (NodePicker + NDV) en lugar de sidebar fijo |
| `VITE_ENABLE_N8N_ANIMATIONS=true` | `N8N_ANIMATIONS` | Edges animados (`AnimatedEdge`) |

`isFeatureEnabled(feature)` — helper: si `N8N_STYLE` está activo, devuelve `true` para cualquier feature con prefijo `N8N_`.

### Canvas y nodos

- **XYFlow canvas:** cada tipo de nodo (`trigger`, `action`, `condition`, `outbound_webhook`, `delay`, `stop`) tiene componente en `components/nodes/`. `nodeTypes.js` mapea el tipo al componente correcto según feature flags: N8n* si `N8N_NODES`, Legacy* si no.
- **Drag & drop desde sidebar:** `NodeSidebar` / `NodePickerPanel` propagan `nodeCategory` en el payload del drag. `AutomationEditor` lo usa en el drop para determinar el tipo de nodo (`nodeCategory === 'action'`).
- **N8nBaseNode shapes:** cada categoría tiene `border-radius` distinto — Trigger: `50% 12px 12px 50%`, Action: `12px`, Condition: `12px` + badge diamond, Stop: `12px 50% 50% 12px`.

### Paneles flotantes (n8n-style)

- **FloatingPanel** (`components/ui/FloatingPanel.jsx`): componente base draggable + resizable usando `framer-motion`. Estado de posición, tamaño y z-index en `useAutomationsStore.panels`. `bringPanelToFront(id)` incrementa `panelZIndexCounter` y asigna el valor al panel tocado.
- **FloatingNDV** (`components/panels/FloatingNDV.jsx`): se auto-abre cuando `selectedNodeId` cambia. Layout de 3 columnas: INPUT (`InputDataPanel`) | Parameters (`NodeConfigPanel`) | OUTPUT (`NodeOutputPanel`). ESC cierra. Click fuera del `.floating-panel` cierra. Se posiciona centrado en el canvas al abrirse.
- **NodePickerPanel** (`components/panels/NodePickerPanel.jsx`): reemplaza el sidebar fijo cuando `N8N_PANELS` está activo. Flotante, searchable, con drag-drop.
- Todos los paneles son `position: absolute` dentro del editor — no portales.

### NodeConfigPanel y SPECIFIC_CONFIGS

`NodeConfigPanel` determina qué UI mostrar con esta lógica de prioridad:
1. Nodos de control de flujo por `node.type` (`condition`, `delay`, `stop`) — siempre renderizan su sub-config específica.
2. Nodos con entrada en `SPECIFIC_CONFIGS[node.data.ref_id]` — renderizan el componente custom (ej: `ScheduleOnceConfig`, `WebhookInboundConfig`).
3. Cualquier otro nodo con `config_schema` — renderiza `GenericNodeConfig` (schema-driven).
4. Sin schema → estado vacío.

Mapa `SPECIFIC_CONFIGS` actual:
```js
'system.schedule_once'                → ScheduleOnceConfig
'system.schedule_interval'            → ScheduleIntervalConfig
'system.webhook_inbound'              → WebhookInboundConfig
'automations_engine.outbound_webhook' → WebhookOutboundConfig
```

Soporta `noContainer` prop — cuando es `true`, renderiza solo el cuerpo (sin wrapper de 280px), usado dentro del FloatingNDV.

### Registry e i18n

`useRegistry.js` exporta `useRegistryTriggers` y `useRegistryActions`. Cada hook:
- Mezcla `SYSTEM_TRIGGERS` (hardcoded, siempre presentes) con los del backend.
- Aplica `t('registry.nodes.{ref_id}')` a los labels de cada nodo.
- Aplica `t('registry.modules.{module_id}')` a los labels de grupo.
- Agrupa por `module_id` usando `MODULE_LABELS` (con fallback `FALLBACK_MODULE`).
- Deduplica por `ref_id` (el backend puede devolver triggers que ya están en `SYSTEM_TRIGGERS`).
- Query keys separadas: `['automations', 'registry', 'triggers']` y `['automations', 'registry', 'actions']`.

### Variables y expresiones

- **VariablePicker**: dropdown para insertar `{{variable.path}}` en campos de texto.
- **ParameterPill**: pill draggable que actúa como drag source; al soltar en un `ExpressionInput`, inserta el token `{{...}}`.
- **ExpressionInput**: input con botón `fx` — si el valor contiene `{{`, muestra una pill en lugar del input raw.
- **ExpressionEditorModal**: modal completo con syntax highlighting, variable browser, y preview del valor con contexto de `last_input`.
- Todos los inputs de `NodeConfigPanel` y `GenericNodeConfig` soportan drop de variables via `onDrop` + `dataTransfer.getData('variable')`.

### Otros comportamientos

- **Registry:** `useRegistryTriggers` / `useRegistryActions` cargan con `staleTime: 10min`.
- **Ejecución streaming:** `useExecution` conecta a SSE del backend para recibir estado por nodo en tiempo real.
- **Trigger manual:** `automationsService.trigger(id, payload)` para testing desde la UI.

## Backend Endpoints

- `GET/POST /api/v1/automations/`
- `GET/PATCH/DELETE /api/v1/automations/{id}`
- `PUT /api/v1/automations/{id}/flow` — actualiza el flujo completo
- `POST /api/v1/automations/{id}/duplicate`
- `POST /api/v1/automations/{id}/trigger` — trigger manual
- `GET /api/v1/automations/registry` — triggers y acciones disponibles
- `GET /api/v1/automations/executions/`
- `GET /api/v1/automations/{id}/executions/stream` — SSE streaming
- `GET/POST /api/v1/automations/webhooks/`
