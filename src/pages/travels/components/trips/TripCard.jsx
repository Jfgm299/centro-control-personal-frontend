import { useTranslation } from 'react-i18next'

function formatDateRange(start, end) {
  if (!start) return null
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const year = s.getFullYear()
  if (!e || start === end) return `${s.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${year}`
  const days = Math.ceil((e - s) / 86400000)
  return `${s.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${year} · ${days}d`
}

export default function TripCard({ trip, onClick, onEdit, onDelete }) {
  const { t } = useTranslation('travels')

  return (
    <div
      onClick={() => onClick(trip.id)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
    >
      {/* Cover photo */}
      <div style={{ height: 160, background: '#f3f4f6', position: 'relative' }}>
        {trip.cover_photo_url
          ? <img src={trip.cover_photo_url} alt={trip.title}
                 className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">✈️</div>
        }

        {/* Country flag overlay */}
        {trip.country_code && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 28, height: 28, borderRadius: '50%',
            overflow: 'hidden', border: '2px solid white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}>
            <img src={`https://flagcdn.com/w40/${trip.country_code.toLowerCase()}.png`}
                 alt={trip.country_code}
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 onError={e => { e.target.style.display = 'none' }} />
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(trip) }}
                  className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-lg hover:bg-white shadow-sm">
            {t('list.edit')}
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(trip.id) }}
                  className="bg-white/90 text-red-500 text-xs px-2 py-1 rounded-lg hover:bg-white shadow-sm">
            {t('list.delete')}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">{trip.title}</h3>
        <p className="text-gray-500 text-sm truncate mt-0.5">{trip.destination}</p>
        {trip.start_date && (
          <p className="text-gray-400 text-xs mt-1.5">{formatDateRange(trip.start_date, trip.end_date)}</p>
        )}
      </div>
    </div>
  )
}