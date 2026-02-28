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
    <div className="px-4 py-5 border-b border-white/10">
      <h2 className="text-white text-xl font-bold mb-1">{t('passport.topAirports')}</h2>
      <p className="text-white/50 text-sm mb-4">
        <span className="text-4xl font-black text-white mr-2">{stats.uniqueAirports}</span>
        {t('passport.totalAirports')}
      </p>

      {visible.map(a => (
        <HorizontalBar
          key={a.iata}
          label={a.iata}
          count={a.count}
          maxCount={maxCount}
        />
      ))}

      {airports.length > INITIAL_SHOW && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[#7c3aed] text-sm mt-2 hover:text-[#9f67ff]"
        >
          {expanded ? t('passport.showLess') : t('passport.showMore')}
        </button>
      )}
    </div>
  )
}