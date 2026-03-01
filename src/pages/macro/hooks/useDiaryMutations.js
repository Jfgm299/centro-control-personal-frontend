import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

function invalidateDiary(qc, date) {
  qc.invalidateQueries({ queryKey: ['macros', 'diary', 'summary', date] })
  qc.invalidateQueries({ queryKey: ['macros', 'diary'] })
  qc.invalidateQueries({ queryKey: ['macros', 'stats'] })
}

/** Añade una entrada al diario. Calcula los nutrientes automáticamente en el backend. */
export function useAddDiaryEntry(date) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/macros/diary', payload)
      return data
    },
    onSuccess: () => invalidateDiary(qc, date),
  })
}

/** Elimina una entrada del diario */
export function useDeleteDiaryEntry(date) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (entryId) => {
      await api.delete(`/api/v1/macros/diary/${entryId}`)
    },
    onSuccess: () => invalidateDiary(qc, date),
  })
}

/** Actualiza la cantidad (g) de una entrada y recalcula nutrientes */
export function useUpdateEntryAmount(date) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ entryId, amount_g }) => {
      const { data } = await api.patch(
        `/api/v1/macros/diary/${entryId}/amount`,
        { amount_g }
      )
      return data
    },
    onSuccess: () => invalidateDiary(qc, date),
  })
}