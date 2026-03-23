import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ACCOUNT_COLORS } from './FilterBar'

const fmt = (v) => `€${v.toFixed(2)}`

/**
 * AccountBreakdown — pie chart showing spending split between accounts
 * for the currently selected month (or all months if none selected).
 */
export default function AccountBreakdown({ byAccount, title }) {
  const { t } = useTranslation('expenses')

  const data = Object.entries(byAccount).map(([name, value]) => ({ name, value }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 shadow-lg p-6 flex flex-col">
      <h2 className="text-base font-semibold text-white mb-1">{title ?? t('chart.accountBreakdown')}</h2>
      <p className="text-xs text-white/60 mb-4">{t('chart.accountBreakdownSub')}</p>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={ACCOUNT_COLORS[entry.name] ?? '#94a3b8'} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(v) => fmt(v)} 
            contentStyle={{ 
              background: 'rgba(30, 41, 59, 0.8)', 
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
            }} 
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }} />
        </PieChart>
      </ResponsiveContainer>

      {/* Per-account rows */}
      <div className="mt-4 flex flex-col gap-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: ACCOUNT_COLORS[entry.name] ?? '#94a3b8' }}
              />
              <span className="text-white/80">{entry.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-white font-semibold">{fmt(entry.value)}</span>
              <span className="text-xs text-white/50 w-10 text-right">
                {total > 0 ? `${((entry.value / total) * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
