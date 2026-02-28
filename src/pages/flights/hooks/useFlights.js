import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flightsService } from '../../../services/flightsService'

export const useFlights = () => {
  const { data: flights = [], isLoading, error } = useQuery({
    queryKey: ['flights'],
    queryFn: flightsService.getAll,
  })

  const past     = flights.filter(f => f.is_past)
  const upcoming = flights.filter(f => !f.is_past)

  return { flights, past, upcoming, isLoading, error: error?.message }
}

export const useAddFlight = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: flightsService.addFlight,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flights'] }),
  })
}

export const useDeleteFlight = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: flightsService.deleteFlight,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flights'] }),
  })
}