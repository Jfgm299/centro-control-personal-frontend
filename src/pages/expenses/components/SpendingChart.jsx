import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ACCOUNT_COLORS } from './FilterBar'

const fmt = (v) => `€${v.toFixed(2)}`

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 shadow-lg rounded-xl p-3 text-sm">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.fill }} />
          <span className="text-white/60">{entry.dataKey}:</span>
          <span className="font-mono font-semibold text-white">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function SpendingChart({ monthlyData, selectedMonthData, drilldownWeek, onDrilldown, accounts }) {
  const { t } = useTranslation('expenses')

  const isWeeklyView = !!selectedMonthData
  const chartData = isWeeklyView
    ? selectedMonthData.weeks.map((w) => ({ label: w.label, ...w.byAccount, total: w.total }))
    : monthlyData.map((m) => ({ label: m.label, ...m.byAccount, total: m.total, monthKey: m.monthKey }))

  const handleBarClick = (data) => {
    if (!isWeeklyView && data?.activePayload?.length) {
      const monthKey = data.activePayload[0]?.payload?.monthKey
      if (monthKey) onDrilldown(monthKey)
    }
  }

  return (
    <div className="h-full relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 shadow-lg p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-white">
            {isWeeklyView
              ? `${t('chart.weeklyTitle')} — ${selectedMonthData.label}`
              : t('chart.monthlyTitle')}
          </h2>
          {!isWeeklyView && (
            <p className="text-xs text-white/60 mt-0.5">{t('chart.clickToDrilldown')}</p>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onClick={handleBarClick} style={{ cursor: isWeeklyView ? 'default' : 'pointer' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.6)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.6)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', paddingTop: 16 }} />
            {accounts.map((account, index) => (
              <Bar
                key={account}
                dataKey={account}
                stackId="a"
                fill={ACCOUNT_COLORS[account] ?? '#94a3b8'}
                radius={index === accounts.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
