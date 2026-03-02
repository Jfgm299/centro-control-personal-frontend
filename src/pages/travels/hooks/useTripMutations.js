import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

function invalidateTrips(qc, tripId = null) {
  qc.invalidateQueries({ queryKey: ['travels', 'trips'] })
  if (tripId) qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId] })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/travels/trips/', payload)
      return data
    },
    onSuccess: () => invalidateTrips(qc),
  })
}

export function useUpdateTrip(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/api/v1/travels/trips/${tripId}`, payload)
      return data
    },
    onSuccess: () => invalidateTrips(qc, tripId),
  })
}

export function useDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tripId) => {
      await api.delete(`/api/v1/travels/trips/${tripId}`)
    },
    onSuccess: () => invalidateTrips(qc),
  })
}

export function useSetTripCover(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photoId) => {
      const { data } = await api.post(`/api/v1/travels/trips/${tripId}/cover`, null, {
        params: { photo_id: photoId },
      })
      return data
    },
    onSuccess: () => invalidateTrips(qc, tripId),
  })
}