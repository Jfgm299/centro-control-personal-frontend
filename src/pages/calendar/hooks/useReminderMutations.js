import { useMutation, useQueryClient } from '@tanstack/react-query'
import { remindersService } from '../services/calendarService'
import { REMINDERS_KEY } from './useReminders'
import { EVENTS_KEY } from './useCalendarEvents'

export function useReminderMutations() {
  const qc = useQueryClient()

  const invalidateReminders = () => qc.invalidateQueries({ queryKey: [REMINDERS_KEY] })
  const invalidateEvents    = () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] })

  const create = useMutation({
    mutationFn: (payload) => remindersService.create(payload),
    onSuccess:  invalidateReminders,
  })

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => remindersService.update(id, payload),
    onSuccess:  invalidateReminders,
  })

  const remove = useMutation({
    mutationFn: (id) => remindersService.remove(id),
    onSuccess:  invalidateReminders,
  })

  /**
   * Asigna un recordatorio a un slot horario.
   * Invalida reminders (desaparece del panel) y events (aparece en el calendario).
   */
  const schedule = useMutation({
    mutationFn: ({ id, ...payload }) => remindersService.schedule(id, payload),
    onSuccess: () => {
      invalidateReminders()
      invalidateEvents()
    },
  })

  return { create, update, remove, schedule }
}