import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/calendarService'
import { EVENTS_KEY } from './useCalendarEvents'

export function useCalendarMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] })

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
   * Usa optimistic update: actualiza el cache inmediatamente para que
   * FullCalendar NO haga el "snap back" al refetch.
   * Si la API falla, revierte el cache y llama a revert() de FullCalendar.
   */
  const move = useMutation({
    mutationFn: ({ id, start, end, allDay }) =>
      eventsService.update(id, {
        start_at: start.toISOString(),
        end_at:   end.toISOString(),
        all_day:  allDay,
      }),

    onMutate: async ({ id, start, end, allDay }) => {
      // Cancela cualquier refetch en curso para que no sobreescriba el optimistic update
      await qc.cancelQueries({ queryKey: [EVENTS_KEY] })

      // Snapshot de todos los caches de eventos
      const previousQueries = qc.getQueriesData({ queryKey: [EVENTS_KEY] })

      // Actualiza optimistamente todos los caches que contienen este evento
      qc.setQueriesData({ queryKey: [EVENTS_KEY] }, (old) => {
        if (!Array.isArray(old)) return old
        return old.map(ev =>
          ev.id === id
            ? { ...ev, start_at: start.toISOString(), end_at: end.toISOString(), all_day: allDay }
            : ev
        )
      })

      // Devuelve el snapshot para poder revertir en onError
      return { previousQueries }
    },

    onError: (_err, _vars, context) => {
      // Restaura el cache anterior
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data)
        })
      }
    },

    // Siempre sincroniza con el servidor al terminar
    onSettled: invalidate,
  })

  return { create, update, complete, remove, move }
}