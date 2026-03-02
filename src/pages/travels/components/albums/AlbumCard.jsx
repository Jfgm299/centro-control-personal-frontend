export default function AlbumCard({ album, onClick, onDelete }) {
  return (
    <div
      onClick={() => onClick(album)}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
    >
      <div style={{ height: 110, background: '#f3f4f6', position: 'relative' }}>
        {album.cover_photo_url
          ? <img src={album.cover_photo_url} alt={album.name}
                 className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
        }
        <button
          onClick={e => { e.stopPropagation(); onDelete(album.id) }}
          className="absolute top-1.5 right-1.5 bg-white/80 text-red-400 text-xs rounded-lg px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
      <div className="px-3 py-2">
        <p className="font-semibold text-gray-900 text-sm truncate">{album.name}</p>
        {album.description && (
          <p className="text-gray-400 text-xs truncate mt-0.5">{album.description}</p>
        )}
      </div>
    </div>
  )
}