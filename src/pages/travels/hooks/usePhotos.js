import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function usePhotos(albumId) {
  return useQuery({
    queryKey: ['travels', 'albums', albumId, 'photos'],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/travels/albums/${albumId}/photos/`)
      return data
    },
    enabled: !!albumId,
    staleTime: 1000 * 60 * 2,
  })
}

function invalidatePhotos(qc, albumId, tripId = null) {
  qc.invalidateQueries({ queryKey: ['travels', 'albums', albumId, 'photos'] })
  qc.invalidateQueries({ queryKey: ['travels', 'favorites'] })
  if (tripId) {
    qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId] })
    qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId, 'albums'] })
  }
}

export function useUploadPhoto(albumId, tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file }) => {
      const { data: urlData } = await api.post(
        `/api/v1/travels/albums/${albumId}/photos/upload-url`,
        { filename: file.name, content_type: file.type }
      )
      const { photo_id, upload_url } = urlData

      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      const { data: photo } = await api.post(
        `/api/v1/travels/photos/${photo_id}/confirm`,
        { size_bytes: file.size }
      )
      return photo
    },
    onSuccess: () => invalidatePhotos(qc, albumId, tripId),
  })
}

export function useUpdatePhoto(albumId, tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ photoId, ...payload }) => {
      const { data } = await api.patch(`/api/v1/travels/photos/${photoId}`, payload)
      return data
    },
    onSuccess: () => invalidatePhotos(qc, albumId, tripId),
  })
}

export function useDeletePhoto(albumId, tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photoId) => {
      await api.delete(`/api/v1/travels/photos/${photoId}`)
    },
    onSuccess: () => invalidatePhotos(qc, albumId, tripId),
  })
}

export function useToggleFavorite(albumId, tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photoId) => {
      const { data } = await api.post(`/api/v1/travels/photos/${photoId}/favorite`)
      return data
    },
    onSuccess: () => invalidatePhotos(qc, albumId, tripId),
  })
}

export function useReorderPhotos(albumId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (order) => {
      const { data } = await api.post(
        `/api/v1/travels/albums/${albumId}/photos/reorder`,
        order
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travels', 'albums', albumId, 'photos'] }),
  })
}

export function useSetAlbumCover(albumId, tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photoId) => {
      const { data } = await api.post(
        `/api/v1/travels/albums/${albumId}/cover?photo_id=${photoId}`
      )
      return data
    },
    onSuccess: () => invalidatePhotos(qc, albumId, tripId),
  })
}

export function useSetTripCover(tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ photoId }) => {
      const { data } = await api.post(
        `/api/v1/travels/trips/${tripId}/cover?photo_id=${photoId}`
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId] })
      qc.invalidateQueries({ queryKey: ['travels', 'trips'] })
    },
  })
}