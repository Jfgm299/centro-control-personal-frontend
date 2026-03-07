import { useMutation, useQueryClient } from '@tanstack/react-query'
import { routinesService } from '../services/calendarService'
import { ROUTINES_KEY } from './useRoutines'
import { EVENTS_KEY } from './useCalendarEvents'

export function useRoutineMutations() {
  const qc = useQueryClient()

  const invalidateRoutines = () => qc.invalidateQueries({ queryKey: [ROUTINES_KEY] })
  const invalidateEvents   = () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] })

  const invalidateBoth = () => {
    invalidateRoutines()
    invalidateEvents()
  }

  const create = useMutation({
    mutationFn: (payload) => routinesService.create(payload),
    onSuccess:  invalidateBoth,
  })

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => routinesService.update(id, payload),
    onSuccess:  invalidateBoth,
  })

  const remove = useMutation({
    mutationFn: (id) => routinesService.remove(id),
    onSuccess:  invalidateBoth,
  })

  /** Cancela o modifica una ocurrencia concreta sin afectar al resto */
  const addException = useMutation({
    mutationFn: ({ routineId, ...payload }) => routinesService.addException(routineId, payload),
    onSuccess:  invalidateEvents,
  })

  return { create, update, remove, addException }
}