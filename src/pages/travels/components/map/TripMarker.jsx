/** Floating popup that appears when the user clicks a map marker.
 *  If the group has 1 trip → show trip card directly.
 *  If the group has multiple trips → show a compact list.
 */
export default function TripMarker({ group, onClose, onTripClick }) {
  const { trips } = group

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        zIndex: 50,
        minWidth: 220, maxWidth: 280,
        background: 'rgba(15, 10, 40, 0.92)',
        border: '1px solid rgba(124, 58, 237, 0.4)',
        borderRadius: 12,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-white/60 text-xs font-mono">
          {trips.length > 1 ? `${trips.length} trips` : trips[0]?.destination}
        </span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 text-lg leading-none"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>

      {/* Trip list */}
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {trips.map(trip => (
          <button
            key={trip.id}
            onClick={() => { onTripClick(trip.id); onClose() }}
            className="w-full text-left hover:bg-white/5 transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div className="flex gap-3 items-center px-3 py-2.5">
              {/* Cover photo or placeholder */}
              <div style={{
                width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                background: 'rgba(124, 58, 237, 0.2)', flexShrink: 0,
              }}>
                {trip.cover_photo_url
                  ? <img src={trip.cover_photo_url} alt={trip.title}
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  fontSize: 20 }}>✈️</div>
                }
              </div>

              <div style={{ minWidth: 0 }}>
                <p className="text-white text-sm font-semibold truncate">{trip.title}</p>
                <p className="text-white/50 text-xs truncate">{trip.destination}</p>
                {trip.start_date && (
                  <p className="text-white/30 text-xs">
                    {new Date(trip.start_date).getFullYear()}
                    {trip.end_date && trip.start_date !== trip.end_date
                      ? ` · ${Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)}d`
                      : ''}
                  </p>
                )}
              </div>

              <span className="text-white/30 ml-auto text-sm">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}