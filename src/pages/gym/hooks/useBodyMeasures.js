import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

export function useBodyMeasures() {
  return useQuery({
    queryKey: ['body-measures'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/body-measures/')
      return data
    },
  })
}

export function useBodyMeasureMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['body-measures'] })

  const create = useMutation({
    mutationFn: (body) => api.post('/api/v1/body-measures/', body).then((r) => r.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/body-measures/${id}`),
    onSuccess: invalidate,
  })

  return { create, remove }
}