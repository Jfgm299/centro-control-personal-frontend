import { useQuery } from '@tanstack/react-query'
import { routinesService } from '../services/calendarService'

export const ROUTINES_KEY = 'calendar_routines'

export function useRoutines() {
  return useQuery({
    queryKey: [ROUTINES_KEY],
    queryFn:  routinesService.getAll,
    staleTime: 1000 * 60 * 5,
  })
}