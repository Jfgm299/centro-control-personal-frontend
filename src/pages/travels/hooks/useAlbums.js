import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useAlbums(tripId) {
  return useQuery({
    queryKey: ['travels', 'trips', tripId, 'albums'],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/travels/trips/${tripId}/albums/`)
      return data
    },
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAlbumById(albumId) {
  return useQuery({
    queryKey: ['travels', 'albums', albumId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/travels/albums/${albumId}`)
      return data
    },
    enabled: !!albumId,
    staleTime: 1000 * 60 * 5,
  })
}

function invalidateAlbums(qc, tripId, albumId = null) {
  qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId, 'albums'] })
  if (albumId) qc.invalidateQueries({ queryKey: ['travels', 'albums', albumId] })
  qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId] })
}

export function useCreateAlbum(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/api/v1/travels/trips/${tripId}/albums/`, payload)
      return data
    },
    onSuccess: () => invalidateAlbums(qc, tripId),
  })
}

export function useUpdateAlbum(tripId, albumId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.patch(`/api/v1/travels/albums/${albumId}`, payload)
      return data
    },
    onSuccess: () => invalidateAlbums(qc, tripId, albumId),
  })
}

export function useDeleteAlbum(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (albumId) => {
      await api.delete(`/api/v1/travels/albums/${albumId}`)
    },
    onSuccess: () => invalidateAlbums(qc, tripId),
  })
}

export function useReorderAlbums(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (order) => {
      const { data } = await api.post(`/api/v1/travels/trips/${tripId}/albums/reorder`, order)
      return data
    },
    onSuccess: () => invalidateAlbums(qc, tripId),
  })
}

export function useSetAlbumCover(tripId, albumId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photoId) => {
      const { data } = await api.post(`/api/v1/travels/albums/${albumId}/cover`, null, {
        params: { photo_id: photoId },
      })
      return data
    },
    onSuccess: () => invalidateAlbums(qc, tripId, albumId),
  })
}