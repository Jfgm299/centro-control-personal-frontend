import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

// ─── useActivities ────────────────────────────────────────────────────────────

export function useActivities(tripId) {
  return useQuery({
    queryKey: ['travels', 'trips', tripId, 'activities'],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/travels/trips/${tripId}/activities/`)
      return data
    },
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── useActivityMutations ─────────────────────────────────────────────────────

function invalidateActivities(qc, tripId) {
  qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId, 'activities'] })
}

export function useCreateActivity(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/api/v1/travels/trips/${tripId}/activities/`, payload)
      return data
    },
    onSuccess: () => invalidateActivities(qc, tripId),
  })
}

export function useUpdateActivity(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ activityId, ...payload }) => {
      const { data } = await api.patch(
        `/api/v1/travels/trips/${tripId}/activities/${activityId}`,
        payload
      )
      return data
    },
    onSuccess: () => invalidateActivities(qc, tripId),
  })
}

export function useDeleteActivity(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (activityId) => {
      await api.delete(`/api/v1/travels/trips/${tripId}/activities/${activityId}`)
    },
    onSuccess: () => invalidateActivities(qc, tripId),
  })
}