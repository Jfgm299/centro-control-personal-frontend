import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircularFlag } from './PassportMap'

const INITIAL_SHOW = 3

export default function CountriesSection({ stats }) {
  const { t }    = useTranslation('flights')
  const [expanded, setExpanded] = useState(false)

  const countries = stats.topCountries
  const visible   = expanded ? countries : countries.slice(0, INITIAL_SHOW)

  return (
    <div className="px-4 py-6 pb-12">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-white/80 text-lg font-bold">{t('passport.countries')}</h2>
        <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            <span className="text-xl font-black text-white mr-1.5">{stats.uniqueCountries}</span>
            {t('passport.totalCountries')}
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm shadow-lg mb-6">
        <div className="flex flex-col gap-2">
          {visible.map(c => (
            <div key={c.code} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
              <div className="flex items-center gap-4">
                <CircularFlag code={c.code} size={36} />
                <span className="text-white font-semibold group-hover:text-blue-300 transition-colors">{c.code}</span>
              </div>
              <span className="text-white/70 font-mono bg-black/20 px-3 py-1 rounded-full text-sm border border-white/5 shadow-inner">
                {c.count} <span className="text-white/30 ml-1 text-xs">flights</span>
              </span>
            </div>
          ))}
        </div>

        {countries.length > INITIAL_SHOW && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full mt-3 py-2 text-center text-white/70 text-sm font-semibold bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
          >
            {expanded ? t('passport.showLess') : t('passport.showMore')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {stats.regions.map(r => (
          <div key={r.key} className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">{t(`passport.regions.${r.key}`)}</p>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-white text-2xl font-black drop-shadow-md">{r.count}</span>
              <span className="text-white/40 text-xs font-medium bg-black/20 px-1.5 py-0.5 rounded-md">{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}