Analiza los cambios recientes y actualiza la documentación en `.claude/docs/` para que refleje el estado actual del código.

## Proceso

1. **Identificar qué cambió:**
   ```bash
   git diff main..HEAD --name-only
   ```

2. **Por cada archivo cambiado, determinar qué doc afecta:**

   | Si cambió... | Actualizar... |
   |---|---|
   | `src/pages/<mod>/index.js` | `docs/modules/<mod>.md` y `docs/modules/README.md` |
   | `src/pages/<mod>/hooks/` | `docs/modules/<mod>.md` — sección State/Hooks |
   | `src/pages/<mod>/store/` | `docs/modules/<mod>.md` y `docs/state-management.md` |
   | `src/lib/createApiClient.js` | `docs/architecture.md` — sección API Client |
   | `src/lib/moduleLoader.js` | `docs/architecture.md` — sección Module System |
   | `src/hooks/useIsMobile.js` | `docs/architecture.md` — sección Responsive Pattern |
   | `src/store/` (global) | `docs/state-management.md` |
   | Nuevo módulo completo | Crear `docs/modules/<mod>.md` y añadir fila en `docs/modules/README.md` |

3. **Leer los archivos afectados** para entender exactamente qué cambió.

4. **Editar los docs** con la información actualizada. Ser preciso — no reescribir secciones que no cambiaron.

5. **Confirmar** qué archivos se actualizaron y qué se cambió en cada uno.

## Cambios que afectan al backend

Si el cambio introduce nuevos endpoints que el frontend necesita, o cambia cómo se consumen, actualizar también el `shared-context.md` del repo del backend (`centro-control/.claude/docs/shared-context.md` — si existe) y el `docs/shared-context.md` de este repo.
