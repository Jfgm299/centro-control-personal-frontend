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
    <div className="px-4 py-5">
      <h2 className="text-white text-xl font-bold mb-1">{t('passport.countries')}</h2>
      <p className="text-white/50 text-sm mb-4">
        <span className="text-5xl font-black text-white mr-2">{stats.uniqueCountries}</span>
        {t('passport.totalCountries')}
      </p>

      <div className="mb-4">
        {visible.map(c => (
          <div key={c.code} className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <CircularFlag code={c.code} size={32} />
              <span className="text-white font-semibold">{c.code}</span>
            </div>
            <span className="text-white/50 text-sm">{c.count} flights</span>
          </div>
        ))}
      </div>

      {countries.length > INITIAL_SHOW && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[#7c3aed] text-sm mb-5 hover:text-[#9f67ff]"
        >
          {expanded ? t('passport.showLess') : t('passport.showMore')}
        </button>
      )}

      <div className="grid grid-cols-3 gap-2 mt-2">
        {stats.regions.map(r => (
          <div key={r.key} className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <p className="text-white/50 text-xs mb-1">{t(`passport.regions.${r.key}`)}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-white text-2xl font-black">{r.count}</span>
              <span className="text-white/40 text-xs">{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}