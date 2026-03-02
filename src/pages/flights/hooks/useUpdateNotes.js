import { useMutation, useQueryClient } from '@tanstack/react-query'
import { flightsService } from '../services/flightsService'

export const useUpdateNotes = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }) => flightsService.updateNotes(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flights'] }),
  })
}