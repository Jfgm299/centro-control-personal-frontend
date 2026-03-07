import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService } from '../services/calendarService'

const CONNECTIONS_KEY = ['calendar', 'connections']
const logsKey = (provider) => ['calendar', 'sync-logs', provider]

/* ── Queries ──────────────────────────────────────────────────────────────── */

export function useConnections() {
  return useQuery({
    queryKey: CONNECTIONS_KEY,
    queryFn:  syncService.getConnections,
  })
}

export function useSyncLogs(provider, enabled = true) {
  return useQuery({
    queryKey: logsKey(provider),
    queryFn:  () => syncService.getLogs(provider),
    enabled:  !!provider && enabled,
  })
}

/* ── Mutations ────────────────────────────────────────────────────────────── */

export function useSyncMutations() {
  const qc = useQueryClient()

  const googleConnect = useMutation({
    mutationFn: syncService.googleConnect,
    onSuccess: (data) => {
      if (data?.auth_url) {
        const popup = window.open(data.auth_url, '_blank', 'width=600,height=700')

        // Detecta cuando el popup se cierra y refresca las conexiones
        const timer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(timer)
            qc.invalidateQueries({ queryKey: CONNECTIONS_KEY })
          }
        }, 500)
      }
    },
  })

  const appleConnect = useMutation({
    mutationFn: syncService.appleConnect,
    onSuccess: () => qc.invalidateQueries({ queryKey: CONNECTIONS_KEY }),
  })

  const disconnect = useMutation({
    mutationFn: syncService.disconnect,
    onSuccess: () => qc.invalidateQueries({ queryKey: CONNECTIONS_KEY }),
  })

  const sync = useMutation({
    mutationFn: syncService.sync,
    onSuccess: (_, provider) => {
      qc.invalidateQueries({ queryKey: CONNECTIONS_KEY })
      qc.invalidateQueries({ queryKey: logsKey(provider) })
      qc.invalidateQueries({ queryKey: ['calendar', 'events'] })  // refresca el calendario
    },
  })

  return { googleConnect, appleConnect, disconnect, sync }
}