import { useQuery } from '@tanstack/react-query'
import { eventsService } from '../services/calendarService'

export const EVENTS_KEY = 'calendar_events'

/**
 * Eventos en el rango visible del calendario.
 * start/end son objetos Date — se recalculan al cambiar la vista.
 */
export function useCalendarEvents(start, end) {
  return useQuery({
    queryKey: [EVENTS_KEY, start?.toISOString(), end?.toISOString()],
    queryFn:  () => eventsService.getRange(start, end),
    enabled:  !!start && !!end,
    staleTime: 1000 * 60 * 2,
  })
}