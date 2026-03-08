# Patterns & Conventions

Reference implementation: `src/pages/gym/`

---

## Module Convention

Cada módulo vive en `src/pages/<name>/` y debe tener:

```
<module>/
├── index.js              ← manifest (id, labelKey, path, component, ...)
├── <Module>Page.jsx      ← entry point: delega a Mobile/Desktop
├── <Module>PageDesktop.jsx
├── <Module>PageMobile.jsx
├── components/           ← componentes propios del módulo
├── hooks/                ← useQuery + useMutation (React Query)
├── services/
│   └── api.js            ← instancia de createApiClient()
└── store/                ← stores Zustand locales (si necesario)
```

---

## Component Convention

```jsx
// Componente funcional, named export
export default function WorkoutCard({ workout, onEnd }) {
  const { t } = useTranslation('gym')

  return (
    <div className="...">
      <h2>{t('workout.title')}</h2>
    </div>
  )
}
```

**Reglas:**
- Siempre `export default function` — nunca arrow function anónima como default
- Props explícitas — no destructuring de `props` genérico
- Todo texto visible pasa por `useTranslation` — nunca strings literales en JSX
- Tailwind para estilos — no CSS modules ni styled-components
- `clsx` para clases condicionales

---

## Hook Convention (React Query)

```js
// hooks/useWorkouts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

// Query — lectura
export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/workouts/')
      return data
    },
  })
}

// Mutation — escritura
export function useWorkoutMutations() {
  const qc = useQueryClient()

  const start = useMutation({
    mutationFn: (body) => api.post('/api/v1/workouts/', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  })

  return { start }
}
```

**Reglas:**
- `queryKey` siempre como array: `['workouts']`, `['workouts', id, 'long']`
- Invalidar queries relacionadas en `onSuccess` — nunca mutar el cache directamente
- `enabled: !!id` para queries que dependen de un ID opcional
- Separar hooks de lectura (`use<Entity>`) y de escritura (`use<Entity>Mutations`)

---

## Service Convention

```js
// services/api.js — siempre igual en todos los módulos
import { createApiClient } from '../../../lib/createApiClient'
const api = createApiClient()
export default api
```

Para módulos con endpoints agrupados, crear un archivo de servicio adicional:

```js
// services/automationsApi.js
import api from './api'

export const automationsService = {
  getAll: async () => (await api.get('/api/v1/automations')).data,
  create: async (payload) => (await api.post('/api/v1/automations', payload)).data,
  remove: async (id) => api.delete(`/api/v1/automations/${id}`),
}
```

---

## Store Convention (Zustand)

```js
// store/activeWorkoutStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'  // solo si necesita persistir

export const useActiveWorkoutStore = create(
  persist(
    (set, get) => ({
      workout: null,

      startWorkout: (workout) => set({ workout }),
      clearWorkout: () => set({ workout: null }),
    }),
    { name: 'active-workout' }  // clave en localStorage
  )
)
```

**Reglas:**
- Usar `persist` solo cuando el estado debe sobrevivir a recargas (ej: workout activo, orden de home, dock)
- No duplicar en Zustand lo que ya gestiona React Query (datos del servidor)
- Nombre del store en kebab-case en `persist`: `'active-workout'`, `'dock-store'`, `'home-order-store'`

---

## i18n Convention

```js
// Namespace = nombre del módulo en minúscula
const { t } = useTranslation('gym')
const { t: tc } = useTranslation('common')  // para textos compartidos

// Claves en dot notation
t('workout.start')       // → "Iniciar entreno"
t('workout.noWorkouts')  // → "No hay entrenamientos"
tc('actions.save')       // → "Guardar"
```

Archivos en `src/i18n/locales/<lang>/<module>.json`. Siempre mantener `es` y `en` sincronizados.
