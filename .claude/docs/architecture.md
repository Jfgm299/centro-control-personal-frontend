# Architecture

## System Overview

```
centro-control-app/
├── src/
│   ├── lib/
│   │   ├── createApiClient.js   ← factory Axios con auth + refresh automático
│   │   └── moduleLoader.js      ← autodiscovery de módulos via import.meta.glob
│   ├── services/
│   │   └── auth.js              ← authService + tokenStorage (localStorage)
│   ├── store/                   ← stores Zustand globales
│   ├── context/
│   │   └── AuthContext.jsx      ← provider de autenticación
│   ├── hooks/
│   │   └── useIsMobile.js       ← detecta Capacitor nativo o pantalla < 768px
│   ├── pages/                   ← un directorio por módulo
│   │   └── <module>/
│   │       ├── index.js         ← manifest del módulo (id, path, component...)
│   │       ├── <Module>Page.jsx          ← entry point (delega a Mobile/Desktop)
│   │       ├── <Module>PageDesktop.jsx
│   │       ├── <Module>PageMobile.jsx
│   │       ├── components/
│   │       ├── hooks/           ← useQuery + useMutation (React Query)
│   │       ├── services/
│   │       │   └── api.js       ← instancia de createApiClient()
│   │       └── store/           ← stores Zustand locales del módulo
│   ├── components/
│   │   ├── layout/              ← shell de la app (tabs, dock, sidebar)
│   │   └── auth/                ← LoginPopup
│   └── i18n/
│       └── locales/
│           ├── es/              ← un .json por módulo
│           └── en/
```

## Module System (autodiscovery)

`moduleLoader.js` usa `import.meta.glob('/src/pages/*/index.js', { eager: true })` para descubrir todos los módulos automáticamente. Un módulo es válido si su `index.js` exporta:

```js
export default {
  id:           'gym_tracker',      // debe coincidir con el module_id del backend
  labelKey:     'nav.gym',          // clave i18n en common.json
  icon:         '🏋️',
  path:         '/gym',             // ruta React Router
  color:        '#6366f1',
  component:    GymPage,            // componente entry point
  permanent:    false,              // si true, no se puede cerrar la tab
  descriptionKey: 'home:modules.gym.description',
}
```

**No hay lista manual.** Crear un directorio en `src/pages/<name>/` con `index.js` válido es suficiente.

## Routing

React Router 7. Las rutas se generan dinámicamente desde `loadAllModules()`. El módulo `home` (id: `'home'`, path: `'/'`) siempre existe y es permanente.

## API Client

Cada módulo crea su propia instancia en `services/api.js`:

```js
import { createApiClient } from '../../../lib/createApiClient'
const api = createApiClient()
export default api
```

`createApiClient()` configura automáticamente:
- `baseURL`: `VITE_API_URL` (o `http://localhost:8000`)
- Request interceptor: añade `Authorization: Bearer <token>`
- Response interceptor: en 401, intenta refresh; si falla, emite `auth:logout`
- Cola de peticiones durante el refresh para evitar múltiples llamadas simultáneas

Tokens en `localStorage`: `access_token` y `refresh_token` (gestionados por `tokenStorage`).

## Responsive Pattern

Cada página implementa el patrón de tres capas:

```jsx
// GymPage.jsx — entry point
export default function GymPage() {
  const isMobile = useIsMobile()
  return isMobile ? <GymPageMobile /> : <GymPageDesktop />
}
```

`useIsMobile()` devuelve `true` si:
- La app corre como app nativa Capacitor (`Capacitor.isNativePlatform()`)
- O el viewport es < 768px (responsive fallback en browser)

**Regla:** nunca mezclar lógica mobile/desktop en un mismo componente. Cada variante tiene su propio archivo.

## i18n

i18next con namespaces por módulo. Convención de archivos:

```
i18n/locales/es/gym.json       ← namespace "gym"
i18n/locales/es/common.json    ← namespace "common" (compartido)
i18n/locales/es/home.json      ← namespace "home"
```

Uso en componentes:
```jsx
const { t } = useTranslation('gym')
t('workout.start')  // → "Iniciar entreno"
```

## Capacitor (iOS + Android)

La app web se empaqueta como app nativa con Capacitor. El `webDir` es `dist` (salida de `vite build`).

Plugins usados:
- `@capacitor/status-bar` — status bar transparente, CSS gestiona safe area
- `@capacitor-mlkit/barcode-scanning` — lector de código de barras (macro_tracker)
- `@capacitor/haptics`

`ios.contentInset: 'never'` — el WebView ocupa toda la pantalla.
