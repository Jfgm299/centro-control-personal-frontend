import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

export default function FlightsSection({ stats }) {
  const { t } = useTranslation('flights')
  const [view, setView] = useState('weekday') // year | month | weekday

  const chartData = {
    year:    stats.yearCounts.map(d => ({ label: String(d.year), count: d.count })),
    month:   stats.monthCounts.map(d => ({ label: d.month, count: d.count })),
    weekday: stats.weekdayCounts.map(d => ({ label: d.day, count: d.count })),
  }[view]

  return (
    <div className="px-4 py-5 border-b border-white/10">
      {/* Header */}
      <div className="flex justify-between items-start mb-1">
        <h2 className="text-white text-xl font-bold">{t('passport.flights')}</h2>
      </div>
      <div className="text-6xl font-black text-white mb-1">{stats.total}</div>
      <div className="flex gap-3 text-sm mb-4">
        <span className="text-white/60"><span className="text-white font-semibold">{stats.domestic}</span> {t('passport.domestic')}</span>
        <span className="text-white/60"><span className="text-white font-semibold">{stats.international}</span> {t('passport.international')}</span>
        <span className="text-white/60"><span className="text-white font-semibold">{stats.longHaul}</span> {t('passport.longHaul')}</span>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">
          {t('passport.flightsPerLabel')}
        </span>
        {['year','month','weekday'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all',
              view === v ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
            )}
          >
            {t(`passport.${v === 'year' ? 'year' : v === 'month' ? 'month' : 'weekday'}`)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={view === 'weekday' ? 28 : 20}>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1a0550', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}