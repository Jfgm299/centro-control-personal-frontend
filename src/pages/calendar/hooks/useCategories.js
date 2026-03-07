import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '../services/calendarService'

export const CATEGORIES_KEY = 'calendar_categories'

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn:  categoriesService.getAll,
    staleTime: 1000 * 60 * 10,
  })
}