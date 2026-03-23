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
    <div className="px-4 py-6 border-b border-white/5">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-white/80 text-lg font-bold">{t('passport.flights')}</h2>
      </div>

      {/* KPI + Breakdown Panel */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
        <div className="text-6xl font-black text-white">{stats.total}</div>
        
        <div className="flex flex-wrap gap-4 text-sm bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 w-fit shadow-lg">
          <span className="text-white/60"><span className="text-white font-bold">{stats.domestic}</span> {t('passport.domestic')}</span>
          <span className="text-white/60"><span className="text-white font-bold">{stats.international}</span> {t('passport.international')}</span>
          <span className="text-white/60"><span className="text-white font-bold">{stats.longHaul}</span> {t('passport.longHaul')}</span>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4 bg-black/20 p-1.5 rounded-full w-fit backdrop-blur-md">
        <span className="text-white/40 text-xs font-semibold tracking-widest uppercase pl-3 pr-2">
          {t('passport.flightsPerLabel')}
        </span>
        {['year','month','weekday'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm',
              view === v ? 'bg-white/20 text-white border border-white/10' : 'text-white/50 hover:text-white/80 border border-transparent'
            )}
          >
            {t(`passport.${v === 'year' ? 'year' : v === 'month' ? 'month' : 'weekday'}`)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 160 }} className="bg-white/5 rounded-3xl p-4 border border-white/10 backdrop-blur-md">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={view === 'weekday' ? 28 : 20}>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}