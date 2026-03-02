import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePhotos, useUploadPhoto, useDeletePhoto, useToggleFavorite, useSetAlbumCover, useSetTripCover } from '../../hooks/usePhotos'
import PhotoLightbox from './PhotoLightbox'
import { ALLOWED_CONTENT_TYPES, MAX_PHOTOS_PER_TRIP } from '../../constants'

export default function PhotoGrid({ album, tripId, onBack }) {
  const { t } = useTranslation('travels')
  const { data: photos = [], isLoading } = usePhotos(album.id)

  const uploadPhoto      = useUploadPhoto(album.id, tripId)
  const deletePhoto      = useDeletePhoto(album.id, tripId)
  const toggleFavorite   = useToggleFavorite(album.id, tripId)
  const setAlbumCover    = useSetAlbumCover(album.id, tripId)
  const setTripCover     = useSetTripCover(tripId)

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState(null)
  const [isFirstUpload, setIsFirstUpload] = useState(false)
  const fileInputRef                      = useRef(null)

  // Track if album has no photos on mount to set first upload flag
  useEffect(() => {
    if (!isLoading && photos.length === 0) {
      setIsFirstUpload(true)
    }
  }, [isLoading, photos.length])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploadError(null)
    setUploading(true)

    let firstPhotoId = null

    for (const file of files) {
      if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
        setUploadError(t('photos.invalidType'))
        continue
      }
      try {
        const uploadedPhoto = await uploadPhoto.mutateAsync({ file })
        
        // If this is the first photo in the album, set it as cover automatically
        if (isFirstUpload && !firstPhotoId) {
          firstPhotoId = uploadedPhoto.id
        }
      } catch (err) {
        const detail = err?.response?.data?.detail
        if (detail?.includes('limit')) setUploadError(t('photos.limitReached', { max: MAX_PHOTOS_PER_TRIP }))
        else setUploadError(t('photos.uploadError'))
        break
      }
    }

    // Set first photo as album cover
    if (firstPhotoId) {
      try {
        await setAlbumCover.mutateAsync(firstPhotoId)
        setIsFirstUpload(false)
      } catch (err) {
        console.error('Failed to set album cover:', err)
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const handleSetTripCover = async (photoId) => {
    try {
      await setTripCover.mutateAsync({ photoId })
    } catch (err) {
      console.error('Failed to set trip cover:', err)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
                className="text-gray-400 hover:text-gray-700 text-sm bg-gray-100 px-2.5 py-1 rounded-lg">
          ← {t('detail.back')}
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 truncate">{album.name}</h2>
          <p className="text-gray-400 text-xs">{photos.length} {t('photos.count')}</p>
        </div>

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_CONTENT_TYPES.join(',')}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
        >
          {uploading
            ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('photos.uploading')}</>
            : `+ ${t('photos.upload')}`
          }
        </button>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between">
          {uploadError}
          <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="text-5xl">📷</div>
          <p className="text-gray-500 font-medium">{t('photos.empty')}</p>
          <button onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 text-white text-sm px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-700">
            {t('photos.upload')}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative cursor-pointer"
            style={{ aspectRatio: '1', background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}
            onClick={() => setLightboxIndex(index)}
          >
            {photo.public_url && (
              <img src={photo.public_url} alt={photo.filename}
                   className="w-full h-full object-cover" />
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-2">
              
              {/* Set as trip cover button */}
              <button
                onClick={e => { e.stopPropagation(); handleSetTripCover(photo.id) }}
                className="text-xs bg-slate-900/90 text-white rounded-lg px-3 py-1.5 font-medium hover:bg-slate-800 transition-all"
                title="Establecer como portada del viaje"
              >
                🖼️ Portada viaje
              </button>

              {/* Bottom actions */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite.mutate(photo.id) }}
                  className="text-lg"
                  title={t('photos.favorite')}
                >
                  {photo.is_favorite ? '❤️' : '🤍'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deletePhoto.mutate(photo.id) }}
                  className="text-sm bg-red-500/80 text-white rounded-lg px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Favorite badge */}
            {photo.is_favorite && (
              <div className="absolute top-1.5 right-1.5 text-sm group-hover:opacity-0">❤️</div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onToggleFavorite={(id) => toggleFavorite.mutate(id)}
          onDelete={(id) => { deletePhoto.mutate(id); setLightboxIndex(null) }}
        />
      )}
    </div>
  )
}