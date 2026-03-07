import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/calendarService'

const EVENTS_QK = ['calendar', 'events']

export function useCalendarMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: EVENTS_QK })

  const create = useMutation({
    mutationFn: (payload) => eventsService.create(payload),
    onSuccess:  invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => eventsService.update(id, payload),
    onSuccess:  invalidate,
  })

  const complete = useMutation({
    mutationFn: (id) => eventsService.complete(id),
    onSuccess:  invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => eventsService.remove(id),
    onSuccess:  invalidate,
  })

  /**
   * Mueve un evento (drag & drop / resize).
   * Optimistic update para que FullCalendar no haga snap back.
   */
  const move = useMutation({
    mutationFn: ({ id, start, end, allDay }) =>
      eventsService.update(id, {
        start_at: start.toISOString(),
        end_at:   end.toISOString(),
        all_day:  allDay,
      }),

    onMutate: async ({ id, start, end, allDay }) => {
      await qc.cancelQueries({ queryKey: EVENTS_QK })
      const previousQueries = qc.getQueriesData({ queryKey: EVENTS_QK })
      qc.setQueriesData({ queryKey: EVENTS_QK }, (old) => {
        if (!Array.isArray(old)) return old
        return old.map(ev =>
          ev.id === id
            ? { ...ev, start_at: start.toISOString(), end_at: end.toISOString(), all_day: allDay }
            : ev
        )
      })
      return { previousQueries }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data)
        })
      }
    },

    onSettled: invalidate,
  })

  return { create, update, complete, remove, move }
}