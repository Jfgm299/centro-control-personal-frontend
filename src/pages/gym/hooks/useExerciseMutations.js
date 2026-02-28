import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

export function useExerciseMutations(workoutId) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['workouts', workoutId, 'long'] })

  const add = useMutation({
    mutationFn: (body) =>
      api.post(`/api/v1/workouts/${workoutId}/exercises`, body).then((r) => r.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (exerciseId) =>
      api.delete(`/api/v1/workouts/${workoutId}/${exerciseId}`),
    onSuccess: invalidate,
  })

  return { add, remove }
}

export function useSetMutations(workoutId, exerciseId) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['workouts', workoutId, 'long'] })

  const add = useMutation({
    mutationFn: (body) =>
      api.post(`/api/v1/workouts/${workoutId}/${exerciseId}/sets`, body).then((r) => r.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (setId) =>
      api.delete(`/api/v1/workouts/${workoutId}/${exerciseId}/sets/${setId}`),
    onSuccess: invalidate,
  })

  return { add, remove }
}