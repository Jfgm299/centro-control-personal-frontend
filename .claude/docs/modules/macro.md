# macro

id: `macro_tracker` | Path: `/macro` | Mobile: ⏳ pendiente | Desktop: ✅

Módulo de seguimiento de macronutrientes. Permite registrar comidas, buscar alimentos por código de barras (Open Food Facts) y gestionar objetivos nutricionales.

## Structure

```
macro/
├── index.js
├── MacroPage.jsx         ← actualmente sirve desktop; mobile pendiente de implementar
├── components/
├── hooks/
│   ├── useDiaryEntries.js
│   ├── useDiaryMutations.js
│   ├── useDailySummary.js
│   ├── useMacroGoals.js
│   ├── useMacroStats.js
│   ├── useBarcodeFromImage.js  ← lector de código de barras (Capacitor MLKit / ZXing)
│   └── index.js
└── services/
    └── api.js
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['diary']` | Entradas del diario del día |
| React Query `['macro-goals']` | Objetivo nutricional del usuario |
| React Query `['macro-stats']` | Estadísticas de macros |

## Key Behaviour

- **Lector de código de barras:** `useBarcodeFromImage` usa `@capacitor-mlkit/barcode-scanning` en nativo y `@zxing/browser` como fallback en browser.
- El backend cachea los productos de Open Food Facts localmente — el frontend solo llama al endpoint del backend, no directamente a OFF.
- `MacroPageMobile` está pendiente de implementar — actualmente `MacroPage` carga la misma vista para mobile y desktop.

## Backend Endpoints

- `GET/POST /api/v1/diary/`
- `GET /api/v1/diary/summary` — resumen del día
- `GET /api/v1/foods/?barcode=<code>` — busca por código de barras
- `GET/PUT /api/v1/goals/` — objetivo nutricional del usuario
