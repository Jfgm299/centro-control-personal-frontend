Crea la estructura completa de un módulo nuevo. Solicita el nombre del módulo si no se proporcionó como argumento.

## Convenciones de nombre
- Directorio: snake_case corto (`gym`, `expenses`, `macro`)
- `id` en el index.js: debe coincidir con el `module_id` del backend (`gym_tracker`, `expenses_tracker`)

## Estructura a crear

```
src/pages/<module>/
├── index.js                    ← manifest del módulo
├── <Module>Page.jsx            ← entry point: delega Mobile/Desktop
├── <Module>PageDesktop.jsx
├── <Module>PageMobile.jsx
├── components/                 ← componentes propios
├── hooks/
│   ├── use<Entity>.js          ← useQuery
│   └── use<Entity>Mutations.js ← useMutation
├── services/
│   └── api.js                  ← instancia createApiClient()
└── store/                      ← solo si necesita estado local persistente
```

## Checklist de implementación

1. **`index.js`** — `id`, `labelKey`, `path`, `component`, `color`, `icon`; el `id` debe coincidir con el backend
2. **`<Module>Page.jsx`** — solo llama a `useIsMobile()` y delega
3. **`services/api.js`** — `import { createApiClient } from '../../../lib/createApiClient'; const api = createApiClient(); export default api`
4. **Hooks de query** — `useQuery` con `queryKey` en array jerárquico
5. **Hooks de mutation** — `useMutation` con `onSuccess` que invalida queries
6. **i18n** — crear `src/i18n/locales/es/<module>.json` y `src/i18n/locales/en/<module>.json`; registrar el namespace en la config de i18n
7. **Doc** — crear `docs/modules/<module>.md` y añadir fila en `docs/modules/README.md`

## Texto visible

Todo texto visible pasa por i18next. Nunca strings literales en JSX.

```jsx
const { t } = useTranslation('<module>')
<button>{t('actions.start')}</button>
```

## Añadir al módulo loader

No hace falta — `moduleLoader.js` autodescubre cualquier `src/pages/*/index.js` válido.
