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
    <div className="px-4 py-6 border-b border-white/5">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-white/80 text-lg font-bold">{t('passport.topAirlines')}</h2>
        <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            <span className="text-xl font-black text-white mr-1.5">{stats.uniqueAirlines}</span>
            {t('passport.totalAirlines')}
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm shadow-lg">
        {/* Toggle */}
        <div className="flex gap-2 mb-6 bg-black/20 p-1.5 rounded-full w-fit">
          {['flights','distance'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                view === v
                  ? 'bg-white/20 text-white shadow-sm border border-white/10'
                  : 'text-white/50 hover:text-white/80 border border-transparent'
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
            color="linear-gradient(90deg, rgba(167,139,250,0.8), rgba(139,92,246,0.9))"
          />
        ))}

        {airlines.length > INITIAL_SHOW && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full mt-4 py-2 text-center text-purple-400 text-sm font-semibold hover:text-purple-300 hover:bg-white/5 rounded-xl transition-colors"
          >
            {expanded ? t('passport.showLess') : t('passport.showMore')}
          </button>
        )}
      </div>
    </div>
  )
}