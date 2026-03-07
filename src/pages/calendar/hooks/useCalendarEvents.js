import { useQuery } from '@tanstack/react-query'
import { eventsService } from '../services/calendarService'

export const EVENTS_KEY = 'calendar_events'

/**
 * Eventos en el rango visible del calendario.
 * start/end son objetos Date — se recalculan al cambiar la vista.
 * Se refresca automáticamente cada 10 minutos (mismo intervalo que el job de sync).
 */
export function useCalendarEvents(start, end) {
  return useQuery({
    queryKey: ['calendar', 'events', start?.toISOString(), end?.toISOString()],
    queryFn:  () => eventsService.getRange(start, end),
    enabled:  !!start && !!end,
    staleTime:       1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 10,  // refresca cada 10 min
  })
}