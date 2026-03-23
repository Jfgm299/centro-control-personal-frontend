import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import HorizontalBar from './HorizontalBar'

const INITIAL_SHOW = 8

export default function AirportsSection({ stats }) {
  const { t } = useTranslation('flights')
  const [expanded, setExpanded] = useState(false)

  const airports  = stats.topAirports
  const maxCount  = airports[0]?.count || 1
  const visible   = expanded ? airports : airports.slice(0, INITIAL_SHOW)

  return (
    <div className="px-4 py-6 border-b border-white/5">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-white/80 text-lg font-bold">{t('passport.topAirports')}</h2>
        <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            <span className="text-xl font-black text-white mr-1.5">{stats.uniqueAirports}</span>
            {t('passport.totalAirports')}
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm shadow-lg">
        {visible.map(a => (
          <HorizontalBar
            key={a.iata}
            label={a.iata}
            count={a.count}
            maxCount={maxCount}
            color="linear-gradient(90deg, rgba(96,165,250,0.8), rgba(59,130,246,0.9))"
          />
        ))}

        {airports.length > INITIAL_SHOW && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full mt-4 py-2 text-center text-blue-400 text-sm font-semibold hover:text-blue-300 hover:bg-white/5 rounded-xl transition-colors"
          >
            {expanded ? t('passport.showLess') : t('passport.showMore')}
          </button>
        )}
      </div>
    </div>
  )
}