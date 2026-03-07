import { useQuery } from '@tanstack/react-query'
import { remindersService } from '../services/calendarService'

export const REMINDERS_KEY = 'calendar_reminders'

/** Solo recordatorios pendientes (status=pending) */
export function useReminders() {
  return useQuery({
    queryKey: [REMINDERS_KEY],
    queryFn:  () => remindersService.getAll({ status: 'pending' }),
    staleTime: 1000 * 60 * 2,
  })
}