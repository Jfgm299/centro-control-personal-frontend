import { useTranslation } from 'react-i18next'

const EARTH_KM = 40075

const ProgressPill = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3 rounded-2xl px-3 py-2 mb-2"
    style={{ background: 'rgba(255,255,255,0.07)' }}>
    <span style={{ fontSize: 28 }}>{icon}</span>
    <div className="flex-1 min-w-0">
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full" style={{
          width: `${Math.min(value * 100, 100)}%`,
          background: color,
          minWidth: value > 0 ? 4 : 0,
        }} />
      </div>
    </div>
    <span className="text-white font-bold text-sm shrink-0">
      {value.toFixed(2)}x {label}
    </span>
  </div>
)

export default function DistanceSection({ stats }) {
  const { t } = useTranslation('flights')
  const km = Math.round(stats.totalDist)
  const mi = Math.round(stats.totalDist * 0.621371)

  return (
    <div className="px-4 py-5 border-b border-white/10">
      <div className="flex justify-between items-start mb-1">
        <h2 className="text-white text-xl font-bold">{t('passport.distance')}</h2>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-5xl font-black text-white">{km.toLocaleString()}</span>
        <span className="text-2xl text-white/50 font-light">km</span>
      </div>
      <p className="text-white/40 text-sm mb-4">{mi.toLocaleString()} mi</p>
      <p className="text-white/60 text-sm mb-4">
        {t('passport.avgDistance')}: {Math.round(stats.avgDist).toLocaleString()} km
      </p>

      <ProgressPill
        icon="🌍"
        label={t('passport.aroundEarth')}
        value={stats.aroundEarth}
        color="linear-gradient(90deg, #4f46e5, #7c3aed)"
      />
      <ProgressPill
        icon="☀️"
        label={t('passport.aroundSun')}
        value={stats.aroundSun}
        color="linear-gradient(90deg, #f59e0b, #ef4444)"
      />
    </div>
  )
}