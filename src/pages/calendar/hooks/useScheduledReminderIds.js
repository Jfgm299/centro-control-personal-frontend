import { useQuery } from '@tanstack/react-query'
import { eventsService } from '../services/calendarService'

/**
 * Devuelve un Set con los reminder_id que ya tienen un evento asignado
 * en los próximos 90 días. Sirve para que el ReminderPanel sepa qué
 * recordatorios están "programados" en el calendario.
 */
export function useScheduledReminderIds() {
  const now   = new Date()
  const end   = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  return useQuery({
    queryKey: ['scheduled_reminder_ids', now.toDateString()],
    queryFn:  async () => {
      const events = await eventsService.getAll(now, end)
      const ids = new Set()
      events.forEach(e => { if (e.reminder_id != null) ids.add(e.reminder_id) })
      return ids
    },
    staleTime: 1000 * 60 * 2,
  })
}