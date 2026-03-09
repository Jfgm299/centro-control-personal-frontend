# expenses

id: `expenses_tracker` | Path: `/expenses` | Mobile: ✅ | Desktop: ✅

Módulo de seguimiento de gastos. Soporta gastos puntuales y gastos programados (suscripciones, recurrentes).

## Structure

```
expenses/
├── index.js
├── ExpensesPage.jsx
├── ExpensesPageDesktop.jsx
├── ExpensesPageMobile.jsx
├── components/
├── hooks/
│   ├── useExpenses.js
│   ├── useExpenseMutations.js
│   └── useScheduledExpenses.js
└── services/
    └── api.js
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['expenses']` | Lista de gastos puntuales |
| React Query `['scheduled-expenses']` | Lista de gastos programados |

## Backend Endpoints

- `GET/POST /api/v1/expenses/`
- `GET/PATCH/DELETE /api/v1/expenses/{id}`
- `GET/POST /api/v1/scheduled-expenses/`
- `GET/PATCH/DELETE /api/v1/scheduled-expenses/{id}`
