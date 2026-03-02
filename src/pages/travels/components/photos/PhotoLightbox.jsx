import { useState, useEffect, useCallback } from 'react'

export default function PhotoLightbox({ photos, initialIndex, onClose, onToggleFavorite, onDelete }) {
  const [index, setIndex] = useState(initialIndex)
  const photo = photos[index]

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex(i => Math.min(photos.length - 1, i + 1)), [photos.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, onClose])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Main image */}
      <img
        src={photo.public_url}
        alt={photo.filename}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '85vh',
          objectFit: 'contain', borderRadius: 8,
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ×
      </button>

      {/* Prev / Next */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl leading-none"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ‹
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl leading-none"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ›
        </button>
      )}

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          {photo.caption && <p className="text-white text-sm">{photo.caption}</p>}
          <p className="text-white/40 text-xs mt-0.5">
            {index + 1} / {photos.length}
            {photo.size_bytes && ` · ${(photo.size_bytes / 1024 / 1024).toFixed(1)} MB`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onToggleFavorite(photo.id)}
            className="text-2xl"
            title="Toggle favorite"
          >
            {photo.is_favorite ? '❤️' : '🤍'}
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="text-white/50 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:border-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}