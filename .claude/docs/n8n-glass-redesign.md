# n8n Glass Redesign — Implementation Guide

> Transformación visual del módulo de automations para replicar exactamente la UI de n8n, adaptada al estilo glass del proyecto.

## Status

**Branch:** `feat/automations-glass-redesign`  
**Total Tasks:** 56  
**Estimated Effort:** 41-51 horas  
**Phases:** 8

---

## Quick Reference

### Feature Flags

```env
VITE_ENABLE_N8N_STYLE=true        # Master flag - habilita todo (N8N_STYLE)
VITE_ENABLE_N8N_GLASS=true        # Alias compat para N8N_STYLE
VITE_ENABLE_N8N_LAYOUT=true       # Layout inline (tabs visibles); false = fullscreen
VITE_ENABLE_N8N_NODES=true        # Solo nodos estilo n8n
VITE_ENABLE_N8N_PANELS=true       # Solo paneles flotantes
VITE_ENABLE_N8N_ANIMATIONS=true   # Solo animaciones de edges
```

Nota: runtime usa `FEATURES.N8N_STYLE` como master switch; `VITE_ENABLE_N8N_GLASS` es alias de compatibilidad de `VITE_ENABLE_N8N_STYLE`. `VITE_ENABLE_N8N_LAYOUT` controla solo el layout (inline vs fullscreen).

### Key Files (Post-Migration)

```
src/
├── styles/
│   ├── glass.css           # Tokens y clases glass centralizadas
│   ├── nodes.css           # Estilos específicos de nodos n8n
│   ├── panels.css          # Estilos de paneles flotantes
│   └── edges.css           # Estilos de edges animados
├── pages/automations/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── AutomationEditor.jsx      # MODIFICADO: sin fullscreen
│   │   │   ├── FloatingPanel.jsx         # NUEVO: base component
│   │   │   ├── NodePickerPanel.jsx       # NUEVO: reemplaza NodeSidebar
│   │   │   ├── FloatingNDV.jsx           # NUEVO: NDV flotante
│   │   │   └── ExpressionEditorModal.jsx # NUEVO: editor de expresiones
│   │   ├── nodes/
│   │   │   ├── N8nBaseNode.jsx           # NUEVO: wrapper estilo n8n
│   │   │   └── ...Node.jsx               # MODIFICADO: usan N8nBaseNode
│   │   └── edges/
│   │       └── AnimatedEdge.jsx          # NUEVO: edge con animación
│   └── store/
│       └── editorStore.js                # MODIFICADO: panel state slice
```

---

## Architecture Decisions

### 1. Paneles Flotantes (no sidebars)

**Decisión:** Los paneles (NodePicker, NDV) son `position: absolute` dentro del editor, NO portales.

**Rationale:**
- Los bounds se respetan automáticamente
- No hay que transformar coordenadas
- El evento `onPaneClick` de ReactFlow sigue funcionando

**Implementación:**
```jsx
<AutomationEditor>
  <ReactFlow ... />
  <FloatingPanel id="node-picker" position={pos} onMove={setPos}>
    <NodePickerPanel />
  </FloatingPanel>
</AutomationEditor>
```

### 2. Estado de Paneles (Zustand)

**Decisión:** Estado de paneles en `editorStore`, no local.

**Slice:**
```js
panels: {
  'node-picker': { x: 20, y: 80, open: true, collapsed: false },
  'ndv': { x: 400, y: 100, open: false, collapsed: false }
},
panelZIndex: { 'node-picker': 10, 'ndv': 11 },
focusPanel: (id) => set(/* incrementa z-index de id */),
```

### 3. Drag & Resize (framer-motion)

**Decisión:** Usar `framer-motion` (ya instalado) en lugar de agregar `react-draggable`.

**Implementación:**
```jsx
<motion.div
  drag
  dragConstraints={parentRef}
  dragMomentum={false}
  onDragEnd={(_, info) => persistPosition(info.point)}
>
```

### 4. Layout (sin fullscreen)

**Decisión:** El editor se renderiza DENTRO de `ModuleContainer`, no como overlay fijo.

**Cambio:**
```diff
- position: fixed; inset: 0; z-index: 100;
+ position: relative; width: 100%; height: 100%;
```

**Efecto:** TabBar permanece visible.

### 5. Nodos (N8nBaseNode wrapper)

**Decisión:** Crear `N8nBaseNode` que envuelve a los nodos existentes.

**Rationale:**
- Rollback trivial: cambiar import
- Separación limpia de estilos

**Shapes por categoría:**
| Categoría | border-radius |
|-----------|---------------|
| Trigger | `50% 12px 12px 50%` (izquierda redondeada) |
| Action | `12px` (full rounded) |
| Condition | `12px` + badge diamond |
| Stop | `12px 50% 50% 12px` (derecha redondeada) |

---

## CSS Tokens (glass.css)

```css
:root {
  /* Glass backgrounds */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-bg-solid: rgba(30, 30, 30, 0.95);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-blur: 20px;
  
  /* Node colors */
  --node-trigger: #10b981;
  --node-action: #f97316;
  --node-condition: #3b82f6;
  --node-stop: #ef4444;
  --node-delay: #8b5cf6;
  
  /* Panel sizing */
  --panel-min-width: 200px;
  --panel-min-height: 150px;
  --panel-header-height: 36px;
}
```

---

## Phase Breakdown

### Phase 1: CSS Foundation (4-5h)
Crear sistema de tokens y clases glass centralizadas.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T1.1 | Crear `src/styles/glass.css` con tokens | S |
| T1.2 | Agregar utility classes (`.glass-panel`, `.glass-input`) | S |
| T1.3 | Agregar `@media (prefers-reduced-motion)` | S |
| T1.4 | Crear `nodes.css` con shapes por categoría | M |
| T1.5 | Crear `panels.css` y `edges.css` | S |
| T1.6 | Crear `index.css` que importa todo + agregar a main | S |

### Phase 2: FloatingPanel Primitive (6-8h)
Componente base reutilizable para todos los paneles.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T2.1 | Agregar slice de paneles a `editorStore` | S |
| T2.2 | Crear `PanelHeader` (drag handle, título, collapse, close) | M |
| T2.3 | Crear `FloatingPanel` con framer-motion drag | M |
| T2.4 | Implementar bounds constraints | S |
| T2.5 | Implementar resize (opcional - corner drag) | M |
| T2.6 | Implementar collapse/expand animation | S |
| T2.7 | Implementar z-index dinámico en focus | S |
| T2.8 | Agregar feature flag gate | S |

### Phase 3: Layout Transformation (3-4h)
Eliminar fullscreen, integrar en layout normal.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T3.1 | Remover `position: fixed` de `AutomationEditor` | S |
| T3.2 | Ajustar estilos para llenar espacio disponible | S |
| T3.3 | Ajustar z-index de paneles flotantes vs canvas | S |
| T3.4 | Ajustar z-index de modales (TestPayload, etc) | S |
| T3.5 | Verificar responsive en tablet | M |

### Phase 4: NodePickerPanel (4-5h)
Reemplazar sidebar fijo por panel flotante.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T4.1 | Renombrar `NodeSidebar` → `NodeSidebar.legacy.jsx` | S |
| T4.2 | Crear `NodePickerPanel` usando `FloatingPanel` | M |
| T4.3 | Implementar búsqueda/filtro de nodos | M |
| T4.4 | Mantener drag-drop existente | S |
| T4.5 | Agregar botón trigger para mostrar/ocultar | S |
| T4.6 | Feature flag gate | S |

### Phase 5: N8n Nodes (8-10h)
Rediseño visual de todos los nodos.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T5.1 | Renombrar `BaseNode` → `BaseNode.legacy.jsx` | S |
| T5.2 | Crear `N8nBaseNode` con shapes por categoría | M |
| T5.3 | Implementar icon badge (emoji/Lucide) | S |
| T5.4 | Implementar estados hover/selected | M |
| T5.5 | Implementar estados de ejecución | M |
| T5.6 | Ajustar handles de conexión | S |
| T5.7 | Migrar `TriggerNode` | M |
| T5.8 | Migrar `ActionNode` | M |
| T5.9 | Migrar `ConditionNode` | M |
| T5.10 | Feature flag gate | S |

### Phase 6: Floating NDV (5-6h)
Node Details View como panel flotante.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T6.1 | Renombrar `NodeDetailsView` → `.legacy.jsx` | S |
| T6.2 | Crear `FloatingNDV` usando `FloatingPanel` | M |
| T6.3 | Auto-abrir al seleccionar nodo | S |
| T6.4 | Posicionar cerca del nodo seleccionado | M |
| T6.5 | Implementar cierre al click fuera | S |
| T6.6 | Feature flag gate | S |
| T6.7 | Stubs para InputPreview/OutputPreview | M |

### Phase 7: Edge Animations (4-5h)
Animaciones de ejecución en edges.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T7.1 | Renombrar `ConditionEdge` → `.legacy.jsx` | S |
| T7.2 | Crear `AnimatedEdge` base component | M |
| T7.3 | Implementar animación de ejecución (dash-offset) | M |
| T7.4 | Implementar colores por estado (success/error) | S |
| T7.5 | Mantener labels de condición (true/false) | S |

### Phase 8: Polish (7-8h)
Expression editor, variable pills, previews.

| Task | Descripción | Esfuerzo |
|------|-------------|----------|
| T8.1 | Crear `ParameterPill` (variable draggable) | M |
| T8.2 | Implementar hover preview con valor | M |
| T8.3 | Implementar drop zones en inputs | M |
| T8.4 | Crear `ExpressionEditorModal` base | M |
| T8.5 | Agregar syntax highlighting básico | M |
| T8.6 | Agregar variable browser en modal | M |
| T8.7 | Agregar botón `fx` para abrir editor | S |
| T8.8 | Crear `InputPreviewPanel` | M |
| T8.9 | Crear `OutputPreviewPanel` | M |

---

## Out of Scope

- Variable replacement logic (backend responsibility)
- New node types
- API changes
- Mobile layout
- Automation list page redesign

---

## Testing Checklist

- [ ] Editor se renderiza dentro del layout (tabs visibles)
- [ ] NodePicker se puede arrastrar dentro del canvas
- [ ] NDV se abre al hacer click en nodo
- [ ] Nodos tienen shapes correctos por categoría
- [ ] Variables se pueden arrastrar a campos
- [ ] Edges se animan durante ejecución
- [ ] Funciona en tablet (1024px)
- [ ] `prefers-reduced-motion` desactiva animaciones

---

## Related Docs

- @docs/modules/automations.md — Documentación general del módulo
- @docs/state-management.md — Zustand patterns
- @docs/patterns.md — Component conventions
