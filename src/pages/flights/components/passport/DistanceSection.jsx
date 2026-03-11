import { useTranslation } from 'react-i18next'

const EARTH_KM = 40075

const ProgressPill = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-4 rounded-3xl p-4 bg-white/5 border border-white/10 backdrop-blur-md">
    <span style={{ fontSize: 32 }} className="drop-shadow-md">{icon}</span>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-end mb-2">
        <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-full">{value.toFixed(2)}x</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden border border-white/5">
        <div className="h-full rounded-full transition-all duration-1000 relative" style={{
          width: `${Math.min(value * 100, 100)}%`,
          background: color,
          minWidth: value > 0 ? 4 : 0,
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
        </div>
      </div>
    </div>
  </div>
)

export default function DistanceSection({ stats }) {
  const { t } = useTranslation('flights')
  const km = Math.round(stats.totalDist)
  const mi = Math.round(stats.totalDist * 0.621371)

  return (
    <div className="px-4 py-6 border-b border-white/5">
      <div className="flex justify-between items-start mb-1">
        <h2 className="text-white/80 text-lg font-bold">{t('passport.distance')}</h2>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-5xl font-black text-white drop-shadow-md">{km.toLocaleString()}</span>
        <span className="text-2xl text-white/50 font-light">km</span>
      </div>
      <div className="flex justify-between items-end mb-6">
        <p className="text-white/40 text-sm">{mi.toLocaleString()} mi</p>
        <p className="text-white/60 text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
          {t('passport.avgDistance')}: <span className="font-semibold text-white">{Math.round(stats.avgDist).toLocaleString()}</span> km
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ProgressPill
          icon="🌍"
          label={t('passport.aroundEarth')}
          value={stats.aroundEarth}
          color="linear-gradient(90deg, #60a5fa, #3b82f6)"
        />
        <ProgressPill
          icon="☀️"
          label={t('passport.aroundSun')}
          value={stats.aroundSun}
          color="linear-gradient(90deg, #fbbf24, #f59e0b)"
        />
      </div>
    </div>
  )
}