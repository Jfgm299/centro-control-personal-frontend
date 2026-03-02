import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useTrips() {
  return useQuery({
    queryKey: ['travels', 'trips'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/travels/trips/')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useTripById(tripId) {
  return useQuery({
    queryKey: ['travels', 'trips', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/travels/trips/${tripId}`)
      return data
    },
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTripsMap() {
  return useQuery({
    queryKey: ['travels', 'trips', 'map'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/travels/trips/map')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useFavoritePhotos() {
  return useQuery({
    queryKey: ['travels', 'favorites'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/travels/trips/favorites')
      return data
    },
    staleTime: 1000 * 60 * 2,
  })
}