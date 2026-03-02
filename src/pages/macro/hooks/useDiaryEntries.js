import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useDiaryEntries({ start, end, meal_type, limit = 500 } = {}) {
  return useQuery({
    queryKey: ['macros', 'diary', { start, end, meal_type }],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/macros/diary', {
        params: { start, end, meal_type, limit },
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}