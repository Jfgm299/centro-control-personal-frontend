# gym

id: `gym_tracker` | Path: `/gym` | Mobile: ✅ | Desktop: ✅

Módulo de seguimiento de entrenamientos. Implementación de referencia — estructura más completa del frontend.

## Structure

```
gym/
├── index.js
├── GymPage.jsx           ← delega Mobile/Desktop via useIsMobile()
├── GymPageDesktop.jsx    ← analytics + workout activo
├── GymPageMobile.jsx
├── components/
│   ├── active/           ← ActiveWorkout, WorkoutSummaryModal
│   ├── analytics/        ← WorkoutCalendar, WorkoutKPIs, WorkoutCharts
│   └── body/             ← BodyMeasuresChart
├── hooks/
│   ├── useWorkouts.js         ← useQuery: lista y detalle
│   ├── useWorkoutMutations.js ← useMutation: start, end, delete
│   ├── useBodyMeasures.js
│   ├── useExerciseMutations.js
│   └── useWorkoutAnalytics.js ← helpers de cálculo (KPIs, charts) — no fetch
├── services/
│   └── api.js            ← instancia de createApiClient()
└── store/
    └── activeWorkoutStore.js ← workout en progreso (persiste en localStorage)
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['workouts']` | Lista de workouts |
| React Query `['workouts', id, 'long']` | Detalle con ejercicios y series |
| `useActiveWorkoutStore` (persist) | Workout activo en curso (sobrevive recarga) |

## Key Behaviour

- `activeWorkoutStore` persiste en `localStorage` con clave `'active-workout'` — si el usuario recarga mientras entrena, no pierde la sesión.
- `useWorkoutAnalytics.js` contiene funciones puras de cálculo (KPIs, datos de gráficas) — no hace fetch, recibe los workouts como parámetro.
- Al terminar un workout, se invalidan `['workouts']` y `['workouts', id, 'long']`.

## Backend Endpoints

- `GET /api/v1/workouts/` — lista
- `GET /api/v1/workouts/{id}` — detalle básico
- `GET /api/v1/workouts/{id}/long` — detalle con ejercicios y series
- `POST /api/v1/workouts/` — iniciar workout
- `POST /api/v1/workouts/{id}` — cerrar workout
- `DELETE /api/v1/workouts/{id}`
- `GET/POST /api/v1/workouts/{id}/exercises`
- `GET/POST /api/v1/body-measures/`
- `GET/POST /api/v1/exercise-catalog/`
