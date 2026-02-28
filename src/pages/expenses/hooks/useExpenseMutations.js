import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

/**
 * Mutations para gastos.
 * Cada mutación invalida automáticamente la caché de 'expenses'
 * para que el listado se refresque sin recargar la página.
 */
export function useExpenseMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['expenses'] })

  const create = useMutation({
    mutationFn: (body) => api.post('/api/v1/expenses/', body).then(r => r.data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/api/v1/expenses/${id}`, body).then(r => r.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/expenses/${id}`),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}