# State Management

## Dos capas de estado

| Capa | Herramienta | Para qué |
|------|-------------|----------|
| Estado del servidor | **React Query** | Datos que vienen de la API (workouts, eventos, gastos...) |
| Estado del cliente | **Zustand** | Estado de UI, navegación, datos efímeros o persistidos en localStorage |

**Regla principal:** si el dato viene del backend, va en React Query. Si es estado de UI puro (qué tab está activa, si un modal está abierto, workout en progreso), va en Zustand.

---

## React Query

### Cuándo usarlo
- Fetch de listas y entidades del backend
- Mutaciones (POST, PATCH, DELETE) con invalidación de cache
- Queries dependientes (`enabled: !!id`)

### Query Keys
Convención de array jerárquico:

```js
['workouts']                    // lista completa
['workouts', id]                // detalle básico
['workouts', id, 'long']        // detalle extendido
['calendar', 'events']
['automations', 'registry']
```

### Invalidación tras mutación
Siempre en `onSuccess`:

```js
const qc = useQueryClient()
const create = useMutation({
  mutationFn: (body) => api.post('/api/v1/workouts/', body).then(r => r.data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
})
```

---

## Zustand — Stores Globales

| Store | Archivo | Persiste | Para qué |
|-------|---------|----------|----------|
| `useModuleStore` | `store/moduleStore.js` | ❌ | Tabs abiertas, tab activa, lista de módulos |
| `useAuthStore` | `store/authStore.js` | ❌ | Usuario autenticado, token en memoria |
| `useDockStore` | `store/dockStore.js` | ✅ `dock-store` | IDs de módulos en el dock móvil (4 slots) |
| `useHomeStore` | `store/homeStore.js` | ✅ `home-order-store` | Orden de iconos en la home |
| `useDragStore` | `store/dragStore.js` | ❌ | Estado de drag-to-dock (efímero) |

### `useModuleStore` — el más importante

Gestiona el sistema de tabs estilo browser:

```js
const { openModule, closeTab, activeTabId, openTabs } = useModuleStore()

openModule('gym_tracker')   // abre tab o la activa si ya está abierta
closeTab('gym_tracker')     // cierra tab (home no se puede cerrar)
```

### `useDockStore` — dock móvil

4 slots (`[0] [1] HOME [2] [3]`). Home siempre en el centro, nunca se almacena.

```js
const { addToDock, removeFromDock, dockIds } = useDockStore()
```

### `useHomeStore` — orden de iconos

Expone `setOrder(ids[])` y `moveModule` (deprecated internamente — el componente usa `setOrder` directamente calculando el nuevo orden desde `orderedModules`). Esto garantiza que funciona aunque `order` en localStorage tenga IDs obsoletos o le falten módulos nuevos.

---

## Zustand — Stores Locales de Módulo

Cada módulo puede tener sus propios stores en `<module>/store/`:

| Store | Módulo | Persiste | Para qué |
|-------|--------|----------|----------|
| `useActiveWorkoutStore` | gym | ✅ `active-workout` | Workout en progreso (sobrevive recargas) |
| `useEditorStore` | automations | ❌ | Estado del editor de flujos (XYFlow) |

### Cuándo crear un store local
- El estado es específico del módulo y no necesitan otros módulos
- Necesita persistir en localStorage (ej: workout activo)
- Es estado de UI complejo que React Query no gestiona (ej: editor de grafo)

---

## Auth Flow

1. `tokenStorage` (localStorage) guarda `access_token` y `refresh_token`
2. `createApiClient()` los inyecta en cada petición automáticamente
3. En 401 → intenta refresh con `authService.refresh()`
4. Si el refresh falla → `tokenStorage.clear()` + `window.dispatchEvent(new Event('auth:logout'))`
5. `AuthContext` escucha `auth:logout` y redirige al login
