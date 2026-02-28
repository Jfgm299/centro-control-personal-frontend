import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

export function useWorkoutMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['workouts'] })

  /** POST /api/v1/workouts/ — arranca un workout */
  const start = useMutation({
    mutationFn: (body) => api.post('/api/v1/workouts/', body).then((r) => r.data),
    onSuccess: invalidate,
  })

  /** POST /api/v1/workouts/{id} — finaliza el workout */
  const end = useMutation({
    mutationFn: ({ workoutId, notes }) =>
      api.post(`/api/v1/workouts/${workoutId}`, { notes }).then((r) => r.data),
    onSuccess: (_, { workoutId }) => {
      qc.invalidateQueries({ queryKey: ['workouts'] })
      qc.invalidateQueries({ queryKey: ['workouts', workoutId, 'long'] })
    },
  })

  /** DELETE /api/v1/workouts/{id} */
  const remove = useMutation({
    mutationFn: (workoutId) => api.delete(`/api/v1/workouts/${workoutId}`),
    onSuccess: invalidate,
  })

  return { start, end, remove }
}