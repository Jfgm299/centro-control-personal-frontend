import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flightsService } from '../services/flightsService'

export const isPastFlight = (f) => {
  if (f.is_past) return true
  const dep = f.scheduled_departure || `${f.flight_date}T23:59:59`
  return new Date(dep) < new Date()
}

export const useFlights = () => {
  const { data: flights = [], isLoading, error } = useQuery({
    queryKey: ['flights'],
    queryFn: flightsService.getAll,
  })

  const past = useMemo(() =>
    flights.filter(isPastFlight)
      .sort((a, b) => new Date(b.flight_date) - new Date(a.flight_date)),
    [flights]
  )

  const upcoming = useMemo(() =>
    flights.filter(f => !isPastFlight(f))
      .sort((a, b) => {
        const dateA = new Date(a.scheduled_departure || `${a.flight_date}T00:00:00`)
        const dateB = new Date(b.scheduled_departure || `${b.flight_date}T00:00:00`)
        return dateA - dateB
      }),
    [flights]
  )

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