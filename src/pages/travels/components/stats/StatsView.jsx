import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTravelsStats } from '../../hooks/useTravelsStats'
import { useFavoritePhotos } from '../../hooks/useTrips'

function KpiCard({ label, value, sub, emoji }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
    </div>
  )
}

function CircularFlag({ code, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', border: '2px solid #e5e7eb', flexShrink: 0,
    }}>
      <img src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
           alt={code}
           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
           onError={e => { e.target.style.display = 'none' }} />
    </div>
  )
}

const CHART_COLORS = ['#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd']

export default function StatsView() {
  const { t } = useTranslation('travels')
  const { stats, isLoading } = useTravelsStats()
  const { data: favorites = [] } = useFavoritePhotos()

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (stats.totalTrips === 0) return (
    <div className="text-center py-20 space-y-2">
      <div className="text-5xl">🌍</div>
      <p className="text-gray-500 font-medium">{t('stats.empty')}</p>
      <p className="text-gray-400 text-sm">{t('stats.emptySub')}</p>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label={t('stats.countries')}
          value={stats.totalCountries}
          sub={t('stats.countriesSub')}
          emoji="🌍"
        />
        <KpiCard
          label={t('stats.trips')}
          value={stats.totalTrips}
          sub={t('stats.tripsSub')}
          emoji="✈️"
        />
        <KpiCard
          label={t('stats.days')}
          value={stats.totalDays}
          sub={t('stats.daysSub', { avg: stats.avgDays })}
          emoji="📅"
        />
        <KpiCard
          label={t('stats.favorites')}
          value={favorites.length}
          sub={t('stats.favoritesSub')}
          emoji="❤️"
        />
      </div>

      {/* Countries visited flags */}
      {stats.visitedCountryCodes.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            {t('stats.countriesVisited')}
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.visitedCountryCodes.map(code => (
              <div key={code} className="flex items-center gap-1.5">
                <CircularFlag code={code} size={24} />
                <span className="text-gray-600 text-xs font-mono">{code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trips per year chart */}
      {stats.tripsByYear.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
            {t('stats.tripsByYear')}
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.tripsByYear} barSize={28}>
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 6 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.tripsByYear.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Favorites gallery */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            {t('stats.favoritesGallery')} · {favorites.length}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {favorites.slice(0, 8).map(photo => (
              <div key={photo.id}
                   style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#f3f4f6' }}>
                {photo.public_url && (
                  <img src={photo.public_url} alt={photo.filename}
                       className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}