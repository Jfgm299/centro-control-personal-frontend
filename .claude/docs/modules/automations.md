# automations

id: `automations_engine` | Path: `/automations` | Mobile: ✅ | Desktop: ✅

Editor visual de flujos de automatización. Usa **XYFlow** (`@xyflow/react`) para el canvas de nodos y edges. Es el módulo más complejo del frontend.

## Structure

```
automations/
├── index.js
├── AutomationsPage.jsx         ← delega Mobile/Desktop
├── AutomationsPageDesktop.jsx
├── AutomationsPageMobile.jsx
├── components/
│   ├── config/     ← paneles de configuración de nodos
│   ├── edges/      ← tipos de edge personalizados
│   ├── editor/     ← canvas XYFlow + toolbar
│   ├── list/       ← lista de automatizaciones
│   └── nodes/      ← tipos de nodo personalizados (trigger, action, condition...)
├── hooks/
│   ├── useAutomations.js       ← React Query: lista y detalle
│   ├── useAutomationMutations.js ← create, update, delete, duplicate, trigger
│   ├── useRegistry.js          ← triggers y acciones disponibles del backend
│   ├── useExecution.js         ← historial de ejecuciones + streaming
│   └── useFlowEditor.js        ← estado del editor XYFlow (nodes, edges, onConnect...)
├── services/
│   ├── api.js
│   └── automationsApi.js       ← automationsService, registryService, executionService, webhookService
└── store/
    └── editorStore.js          ← estado del editor (nodo seleccionado, panel abierto, modo)
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['automations']` | Lista de automatizaciones |
| React Query `['automations', id]` | Detalle + flow completo |
| React Query `['automations', 'registry']` | Triggers y acciones disponibles |
| React Query `['executions', id]` | Historial de ejecuciones |
| `editorStore` (Zustand) | Nodo seleccionado, panel de config abierto, modo edición/vista |
| `useFlowEditor` | Lógica de XYFlow: nodes, edges, handlers de conexión |

## Key Behaviour

- **XYFlow canvas:** los nodos se renderizan como componentes React custom. Cada tipo de nodo (`trigger`, `action`, `condition`, `outbound_webhook`, `automation_call`, `delay`, `stop`) tiene su propio componente en `components/nodes/`.
- **Drag & drop desde sidebar:** `NodeSidebar` propaga `nodeCategory` ("trigger" | "action") a través de `NodeSidebarSection` → `NodeSidebarItem`, que lo incluye en el payload del drag. `AutomationEditor` lo usa en el drop para determinar el tipo de nodo correcto (`nodeCategory === 'action'`).
- **Registry:** `useRegistry` carga todos los triggers y acciones registrados en el backend. Se usa para poblar los selectores al configurar nodos.
- **Ejecución streaming:** `useExecution` puede conectarse a un SSE/stream del backend para recibir el estado de cada nodo en tiempo real durante la ejecución.
- **Trigger manual:** `automationsService.trigger(id, payload)` permite disparar un flujo desde la UI para testing.

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
