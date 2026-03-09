# flights

id: `flights_tracker` | Path: `/flights` | Mobile: ✅ | Desktop: ✅

Módulo de seguimiento de vuelos con estado en tiempo real vía AeroDataBox API.

## Structure

```
flights/
├── index.js
├── FlightsPage.jsx
├── FlightsPageDesktop.jsx
├── FlightsPageMobile.jsx
├── components/
├── hooks/
│   ├── useFlights.js
│   ├── useFlightStats.js
│   ├── useUpdateNotes.js
│   └── index.js
└── services/
    ├── api.js
    └── flightsService.js   ← funciones agrupadas para endpoints de vuelos
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['flights']` | Lista de vuelos del usuario |

## Key Behaviour

- El enriquecimiento de datos (estado del vuelo, aeropuerto, horarios) lo hace el backend llamando a AeroDataBox — el frontend recibe los datos ya procesados.
- `useUpdateNotes` es un hook de mutación para actualizar solo las notas de un vuelo sin refetch completo.

## Backend Endpoints

- `GET/POST /api/v1/flights/`
- `GET/PATCH/DELETE /api/v1/flights/{id}`
