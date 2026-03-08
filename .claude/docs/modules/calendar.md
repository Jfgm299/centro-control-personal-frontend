# calendar

id: `calendar_tracker` | Path: `/calendar` | Mobile: ✅ | Desktop: ✅

Módulo de calendario con eventos, recordatorios, rutinas y sincronización con Google y Apple Calendar. Usa FullCalendar para la vista de calendario.

## Structure

```
calendar/
├── index.js
├── CalendarPage.jsx
├── CalendarPageDesktop.jsx
├── CalendarPageMobile.jsx
├── components/
├── hooks/
│   ├── useCalendarEvents.js
│   ├── useCalendarMutations.js
│   ├── useReminders.js
│   ├── useReminderMutations.js
│   ├── useRoutines.js
│   ├── useRoutineMutations.js
│   ├── useCategories.js
│   ├── useCategoryMutations.js
│   ├── useScheduledReminderIds.js
│   └── useSync.js              ← sincronización con Google/Apple
├── services/
│   ├── api.js
│   └── calendarService.js      ← funciones agrupadas de calendar
└── store/
    └── calendarStore.js        ← vista activa, fecha seleccionada, filtros
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['calendar', 'events']` | Eventos del calendario |
| React Query `['calendar', 'reminders']` | Recordatorios |
| React Query `['calendar', 'routines']` | Rutinas (eventos recurrentes) |
| React Query `['calendar', 'categories']` | Categorías |
| `calendarStore` (Zustand) | Vista activa (mes/semana/día), fecha seleccionada, filtros de categoría |

## Key Behaviour

- **FullCalendar** — `@fullcalendar/react` con plugins `daygrid`, `timegrid`, `interaction`.
- **Sync Google/Apple:** `useSync` gestiona el flujo OAuth2 (Google) y CalDAV (Apple). El backend maneja las credenciales cifradas.
- **Push notifications:** el backend envía notificaciones via Firebase FCM — el frontend solo necesita registrar el token FCM al iniciar sesión.
- Los triggers time-based del automation contract (`event_start`, `event_end`) están pendientes de corrección en el backend.

## Backend Endpoints

- `GET/POST /api/v1/events/`
- `GET/PATCH/DELETE /api/v1/events/{id}`
- `GET/POST /api/v1/reminders/`
- `GET/PATCH/DELETE /api/v1/reminders/{id}`
- `GET/POST /api/v1/routines/`
- `GET/POST /api/v1/categories/`
- `POST /api/v1/calendar/sync/google` — inicia OAuth2
- `POST /api/v1/calendar/sync/apple`
