import { useQuery, useQueries } from '@tanstack/react-query'
import api from '../services/api'

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/workouts/')
      return data
    },
  })
}

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

export function useWorkoutDetails(workoutIds = []) {
  return useQueries({
    queries: workoutIds.map((id) => ({
      queryKey: ['workouts', id, 'long'],
      queryFn: async () => {
        const { data } = await api.get(`/api/v1/workouts/${id}/long`)
        return data
      },
      staleTime: 1000 * 60 * 10,
    })),
  })
}