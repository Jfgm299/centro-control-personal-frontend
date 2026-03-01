import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'

/** Resumen del día: entradas agrupadas por comida, totales y % de objetivos */
export function useDailySummary(date) {
  return useQuery({
    queryKey: ['macros', 'diary', 'summary', date],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/macros/diary/summary', {
        params: { date },
      })
      return data
    },
    enabled: !!date,
  })
}