import { useTranslation } from 'react-i18next'

const fmt = (hours) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

export default function TimeSection({ stats }) {
  const { t } = useTranslation('flights')
  const h = Math.floor(stats.totalHours)
  const m = Math.round((stats.totalHours - h) * 60)

  const rows = [
    { label: t('passport.days'),   value: (stats.totalHours / 24).toFixed(1) },
    { label: t('passport.weeks'),  value: (stats.totalHours / 168).toFixed(1) },
    { label: t('passport.months'), value: (stats.totalHours / 730).toFixed(2) },
    { label: t('passport.years'),  value: (stats.totalHours / 8760).toFixed(3) },
  ]

  return (
    <div className="px-4 py-5 border-b border-white/10">
      <h2 className="text-white text-xl font-bold mb-1">{t('passport.flightTime')}</h2>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-black text-white">{h}</span>
        <span className="text-2xl text-white/50">h</span>
        <span className="text-5xl font-black text-white ml-2">{m}</span>
        <span className="text-2xl text-white/50">m</span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
        {rows.map(r => (
          <div key={r.label}>
            <p className="text-white/40 text-xs uppercase tracking-wide">{r.label}</p>
            <p className="text-white text-2xl font-bold">{r.value}</p>
          </div>
        ))}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wide">{t('passport.avgFlightTime')}</p>
          <p className="text-white text-2xl font-bold">{fmt(stats.avgHours)}</p>
        </div>
      </div>

      {/* Shortest / Longest */}
      {stats.shortest && (
        <div className="mb-3">
          <p className="text-white/50 text-sm mb-1">{t('passport.shortestFlight')}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">
                {stats.shortest.origin_city || stats.shortest.origin_iata} →{' '}
                {stats.shortest.destination_city || stats.shortest.destination_iata}
              </p>
              <p className="text-white/40 text-xs">
                {stats.shortest.flight_number} · {stats.shortest.flight_date}
              </p>
            </div>
            <span className="text-white font-bold">
              {Math.round(stats.shortest.distance_km).toLocaleString()} km
            </span>
          </div>
        </div>
      )}
      {stats.longest && (
        <div>
          <p className="text-white/50 text-sm mb-1">{t('passport.longestFlight')}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">
                {stats.longest.origin_city || stats.longest.origin_iata} →{' '}
                {stats.longest.destination_city || stats.longest.destination_iata}
              </p>
              <p className="text-white/40 text-xs">
                {stats.longest.flight_number} · {stats.longest.flight_date}
              </p>
            </div>
            <span className="text-white font-bold">
              {Math.round(stats.longest.distance_km).toLocaleString()} km
            </span>
          </div>
        </div>
      )}
    </div>
  )
}