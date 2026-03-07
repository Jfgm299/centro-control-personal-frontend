import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '../services/calendarService'
import { CATEGORIES_KEY } from './useCategories'

export function useCategoryMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] })

  const create = useMutation({
    mutationFn: (payload) => categoriesService.create(payload),
    onSuccess:  invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, ...payload }) => categoriesService.update(id, payload),
    onSuccess:  invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => categoriesService.remove(id),
    onSuccess:  invalidate,
  })

  return { create, update, remove }
}