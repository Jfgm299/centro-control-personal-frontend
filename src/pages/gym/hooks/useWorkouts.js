import { useQuery, useQueries } from '@tanstack/react-query'
import api from '../../../services/api'

/** Lista simple de todos los workouts (sin exercises/sets) */
export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/workouts/')
      return data
    },
  })
}

/** Workout con todos los detalles (exercises + sets anidados) */
export function useWorkoutDetail(workoutId) {
  return useQuery({
    queryKey: ['workouts', workoutId, 'long'],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/workouts/${workoutId}/long`)
      return data
    },
    enabled: !!workoutId,
  })
}

/**
 * Carga múltiples workouts en detalle de forma paralela.
 * Usado por las analíticas de progresión de ejercicios.
 * Solo se activa cuando workoutIds tiene elementos.
 */
export function useWorkoutDetails(workoutIds = []) {
  return useQueries({
    queries: workoutIds.map((id) => ({
      queryKey: ['workouts', id, 'long'],
      queryFn: async () => {
        const { data } = await api.get(`/api/v1/workouts/${id}/long`)
        return data
      },
      staleTime: 1000 * 60 * 10, // 10 min — datos históricos cambian poco
    })),
  })
}