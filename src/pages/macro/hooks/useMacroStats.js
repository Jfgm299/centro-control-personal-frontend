import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'

/** Estadísticas del período: medias diarias, top productos, consistencia */
export function useMacroStats(days = 30) {
  return useQuery({
    queryKey: ['macros', 'stats', days],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/macros/stats', {
        params: { days },
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}