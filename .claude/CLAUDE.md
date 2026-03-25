# Centro Control — Frontend

## Stack
React 18 · Vite · Tailwind CSS 4 · Zustand · React Query · Axios · React Router 7 · Capacitor (iOS + Android) · i18next · FullCalendar · XYFlow

## Critical Rules
- **Nunca hardcodear texto visible** — todo pasa por i18next (`useTranslation`)
- **Nunca hacer fetch directo con axios/fetch** — usar siempre `createApiClient()` para que el refresh token funcione
- **Nunca usar `any` ni suprimir tipos TypeScript** sin justificación
- **`VITE_API_URL`** — única env var para la URL del backend; no hardcodear `localhost:8000`
- **Capacitor**: no usar APIs de browser que no existan en nativo (localStorage sí, pero cuidado con otros)

## Branch & Commit Conventions
- Branches: `feat/<name>`, `fix/<name>`, `chore/<name>`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- Nunca commitear directamente a `main`

## Architecture Docs
@docs/architecture.md        — module system, routing, API client, responsive pattern
@docs/patterns.md            — módulo, componente, store, service conventions
@docs/state-management.md    — Zustand vs React Query, cuándo usar cada uno
@docs/shared-context.md      — estado cross-repo, módulos activos, endpoints

## Module Docs
@docs/modules/README.md
@docs/modules/gym.md
@docs/modules/expenses.md
@docs/modules/macro.md
@docs/modules/flights.md
@docs/modules/travels.md
@docs/modules/calendar.md
@docs/modules/automations.md
@docs/modules/home.md

## Active Changes
@docs/n8n-glass-redesign.md — n8n UI clone implementation guide (56 tasks, 8 phases)

## Quick Reference
```bash
npm run dev          # dev server
npm run build        # build para Capacitor / deploy
npx cap sync         # sincronizar web → iOS/Android
npx cap open ios     # abrir en Xcode
npx cap open android # abrir en Android Studio
```
