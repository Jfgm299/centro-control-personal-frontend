import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import HorizontalBar from './HorizontalBar'

const INITIAL_SHOW = 8

export default function AirlinesSection({ stats }) {
  const { t } = useTranslation('flights')
  const [view, setView]     = useState('flights') // flights | distance
  const [expanded, setExpanded] = useState(false)

  const airlines  = [...stats.topAirlines].sort((a, b) =>
    view === 'flights' ? b.count - a.count : b.distance - a.distance
  )
  const maxVal  = airlines[0]?.[view === 'flights' ? 'count' : 'distance'] || 1
  const visible = expanded ? airlines : airlines.slice(0, INITIAL_SHOW)

  return (
    <div className="px-4 py-5 border-b border-white/10">
      <h2 className="text-white text-xl font-bold mb-1">{t('passport.topAirlines')}</h2>
      <p className="text-white/50 text-sm mb-3">
        <span className="text-4xl font-black text-white mr-2">{stats.uniqueAirlines}</span>
        {t('passport.totalAirlines')}
      </p>

      {/* Toggle */}
      <div className="flex gap-1 mb-4">
        {['flights','distance'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all border',
              view === v
                ? 'bg-white text-gray-900 border-white'
                : 'border-white/20 text-white/50 hover:text-white/80'
            )}
          >
            {v === 'flights' ? t('passport.flightsByFlights') : t('passport.flightsByDistance')}
          </button>
        ))}
      </div>

      {visible.map(a => (
        <HorizontalBar
          key={a.iata}
          label={a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name}
          count={view === 'flights' ? a.count : Math.round(a.distance)}
          maxCount={maxVal}
          sublabel={view === 'distance' ? 'km' : undefined}
        />
      ))}

      {airlines.length > INITIAL_SHOW && (
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