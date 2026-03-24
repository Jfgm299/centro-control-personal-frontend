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
    <div className="px-4 py-6 border-b border-white/5">
      <h2 className="text-white/80 text-lg font-bold mb-1">{t('passport.flightTime')}</h2>
      <div className="flex items-baseline gap-1 mb-6 drop-shadow-md">
        <span className="text-5xl font-black text-white">{h}</span>
        <span className="text-2xl text-white/50">h</span>
        <span className="text-5xl font-black text-white ml-2">{m}</span>
        <span className="text-2xl text-white/50">m</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {rows.map(r => (
          <div key={r.label} className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{r.label}</p>
            <p className="text-white text-xl font-bold">{r.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
        <div className="mb-4 pb-4 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wide font-semibold mb-1">{t('passport.avgFlightTime')}</p>
          <p className="text-white text-2xl font-bold">{fmt(stats.avgHours)}</p>
        </div>

        {/* Shortest / Longest */}
        <div className="flex flex-col gap-4">
          {stats.shortest && (
            <div>
              <p className="text-blue-300 text-xs uppercase tracking-widest font-bold mb-1 bg-blue-500/20 px-2 py-0.5 rounded-md inline-block">{t('passport.shortestFlight')}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">
                    {stats.shortest.origin_city || stats.shortest.origin_iata} <span className="text-white/30">→</span>{' '}
                    {stats.shortest.destination_city || stats.shortest.destination_iata}
                  </p>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    {stats.shortest.flight_number} · {new Date(stats.shortest.flight_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-white font-bold bg-white/10 px-2 py-1 rounded-lg text-sm">
                  {Math.round(stats.shortest.distance_km).toLocaleString()} km
                </span>
              </div>
            </div>
          )}
          
          {stats.longest && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-purple-300 text-xs uppercase tracking-widest font-bold mb-1 bg-purple-500/20 px-2 py-0.5 rounded-md inline-block">{t('passport.longestFlight')}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">
                    {stats.longest.origin_city || stats.longest.origin_iata} <span className="text-white/30">→</span>{' '}
                    {stats.longest.destination_city || stats.longest.destination_iata}
                  </p>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    {stats.longest.flight_number} · {new Date(stats.longest.flight_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-white font-bold bg-white/10 px-2 py-1 rounded-lg text-sm">
                  {Math.round(stats.longest.distance_km).toLocaleString()} km
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}