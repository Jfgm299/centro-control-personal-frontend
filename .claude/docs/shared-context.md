# Shared Context — Frontend ↔ Backend

Actualizar este archivo cuando cambien endpoints, módulos, o decisiones cross-repo relevantes para el frontend.

## Estado actual (2026-03-08)

- **8 módulos** activos: `home`, `gym_tracker`, `expenses_tracker`, `macro_tracker`, `flights_tracker`, `travels_tracker`, `calendar_tracker`, `automations_engine`
- Backend repo: `centro-control/` — API en `http://localhost:8000` (dev) via `VITE_API_URL`
- Head del backend: migración `800779485bb7` (`create_calendar_connections_and_sync_`)

## Módulos y sus rutas de API

| Módulo frontend | id backend | Prefijo API |
|----------------|------------|-------------|
| `gym` | `gym_tracker` | `/api/v1/workouts`, `/api/v1/body-measures`, `/api/v1/exercise-catalog` |
| `expenses` | `expenses_tracker` | `/api/v1/expenses`, `/api/v1/scheduled-expenses` |
| `macro` | `macro_tracker` | `/api/v1/diary`, `/api/v1/foods`, `/api/v1/goals` |
| `flights` | `flights_tracker` | `/api/v1/flights` |
| `travels` | `travels_tracker` | `/api/v1/trips`, `/api/v1/albums`, `/api/v1/photos` |
| `calendar` | `calendar_tracker` | `/api/v1/events`, `/api/v1/reminders`, `/api/v1/routines`, `/api/v1/categories` |
| `automations` | `automations_engine` | `/api/v1/automations` |

## Auth endpoints

| Acción | Endpoint |
|--------|----------|
| Register | `POST /api/v1/auth/register` |
| Login | `POST /api/v1/auth/login` |
| Refresh | `POST /api/v1/auth/refresh` |
| Logout | `POST /api/v1/auth/logout` |
| Me | `GET /api/v1/auth/me` |

## Decisiones cross-repo estables

- El `id` del módulo frontend debe coincidir exactamente con el `module_id` del backend (ej: `gym_tracker`, no `gym`)
- `travels_tracker` usa Cloudflare R2 para fotos — las URLs de fotos son URLs públicas de R2, no endpoints de la API
- `calendar_tracker` tiene integración con Google Calendar y Apple Calendar (CalDAV)
- Las push notifications del calendario van vía Firebase (FCM)

## Pendiente / próximos pasos conocidos

- Arreglar triggers time-based de `calendar_tracker` (ej: `event_start`) — no funcionan correctamente en el backend
- Añadir automation contract al resto de módulos del backend
- CORS del backend es `allow_origins=["*"]` — pendiente de restringir
