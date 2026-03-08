# travels

id: `travels_tracker` | Path: `/travels` | Mobile: ✅ | Desktop: ✅

Módulo de seguimiento de viajes con soporte para fotos. Las fotos se almacenan en Cloudflare R2 — las URLs son públicas y se muestran directamente en el frontend.

## Structure

```
travels/
├── index.js
├── TravelsPage.jsx
├── TravelsPageDesktop.jsx
├── TravelsPageMobile.jsx
├── components/
├── hooks/
│   ├── useTrips.js
│   ├── useTripMutations.js
│   ├── useAlbums.js
│   ├── usePhotos.js
│   ├── useActivities.js
│   └── useTravelsStats.js
└── services/
    └── api.js
```

## State

| Fuente | Para qué |
|--------|----------|
| React Query `['trips']` | Lista de viajes |
| React Query `['trips', id, 'albums']` | Álbumes de un viaje |
| React Query `['albums', id, 'photos']` | Fotos de un álbum |

## Key Behaviour

- **Fotos:** el frontend hace upload multipart al backend (`POST /api/v1/photos/`). El backend sube a R2 y devuelve la `public_url`. El frontend muestra esa URL directamente — nunca maneja credenciales de R2.
- Las URLs de fotos son permanentes y públicas — se pueden mostrar en `<img src={photo.public_url} />` sin auth.

## Backend Endpoints

- `GET/POST /api/v1/trips/`
- `GET/PATCH/DELETE /api/v1/trips/{id}`
- `GET/POST /api/v1/trips/{id}/albums`
- `GET/POST /api/v1/albums/{id}/photos`
- `DELETE /api/v1/photos/{id}`
- `GET/POST /api/v1/trips/{id}/activities`
