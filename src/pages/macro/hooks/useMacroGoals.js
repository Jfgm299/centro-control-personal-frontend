import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

/** Objetivos nutricionales del usuario (se crean con defaults si no existen) */
export function useMacroGoals() {
  return useQuery({
    queryKey: ['macros', 'goals'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/macros/goals')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

/** Crea o actualiza los objetivos nutricionales */
export function useUpsertGoals() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put('/api/v1/macros/goals', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['macros', 'goals'] })
      qc.invalidateQueries({ queryKey: ['macros', 'diary', 'summary'] })
    },
  })
}