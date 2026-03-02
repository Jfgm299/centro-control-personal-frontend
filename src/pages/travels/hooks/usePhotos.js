import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

// ─── usePhotos ────────────────────────────────────────────────────────────────

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

// ─── usePhotoMutations ────────────────────────────────────────────────────────

function invalidatePhotos(qc, albumId, tripId = null) {
  qc.invalidateQueries({ queryKey: ['travels', 'albums', albumId, 'photos'] })
  qc.invalidateQueries({ queryKey: ['travels', 'favorites'] })
  if (tripId) {
    qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId] })
    qc.invalidateQueries({ queryKey: ['travels', 'trips', tripId, 'albums'] })
  }
}

/**
 * Full upload flow:
 *   1. POST /upload-url  → get presigned URL + photo_id
 *   2. PUT presigned URL → upload file directly to R2
 *   3. POST /confirm     → mark as uploaded
 *   4. (Optional) Set as album cover if first photo
 */
export function useUploadPhoto(albumId, tripId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file }) => {
      // Step 1: request presigned URL
      const { data: urlData } = await api.post(
        `/api/v1/travels/albums/${albumId}/photos/upload-url`,
        { filename: file.name, content_type: file.type }
      )
      const { photo_id, upload_url } = urlData

      // Step 2: upload directly to R2 (no auth header — it's a presigned URL)
      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      // Step 3: confirm
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

// ─── Cover photo mutations ────────────────────────────────────────────────────

/**
 * Set album cover photo
 */
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

/**
 * Set trip cover photo
 */
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