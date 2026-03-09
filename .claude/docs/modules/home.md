# home

id: `home` | Path: `/` | Mobile: ✅ | Desktop: ✅ | permanent: true

Pantalla de inicio. Muestra los módulos instalados como iconos. En mobile soporta drag-to-dock y reordenación por drag & drop.

## Structure

```
home/
├── index.js
├── HomePage.jsx          ← delega a Mobile/Desktop
├── HomePageDesktop.jsx   ← grid de módulos, navegación por tabs
└── HomePageMobile.jsx    ← iconos reordenables, drag-to-dock
```

## State

| Store | Para qué |
|-------|----------|
| `useModuleStore` | Lista de módulos, abrir tabs |
| `useHomeStore` (persist) | Orden de iconos en home mobile |
| `useDragStore` | Estado de drag en curso (ghost, overDock) |
| `useDockStore` (persist) | IDs pinned en el dock móvil |

## Key Behaviour

- **Desktop:** navegación por tabs estilo browser. `openModule(id)` abre o activa la tab.
- **Mobile:** iconos arrastrables. Al soltar sobre el dock, `addToDock(moduleId)` lo fija.
- `home` es `permanent: true` — no aparece en `closeTab()` ni se puede eliminar.
- El orden de iconos se persiste en localStorage (`home-order-store`).

## Dock Mobile

4 slots: `[0] [1] HOME [2] [3]`. Home siempre en el centro. `dockBounds` se actualiza en cada render del `DockMobile` para detectar si el ghost está sobre él durante el drag.
