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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <h2 className="text-base font-semibold text-slate-800 mb-1">{title ?? t('chart.accountBreakdown')}</h2>
      <p className="text-xs text-slate-400 mb-4">{t('chart.accountBreakdownSub')}</p>

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
              <Cell key={entry.name} fill={ACCOUNT_COLORS[entry.name] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => fmt(v)} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
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
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-800 font-semibold">{fmt(entry.value)}</span>
              <span className="text-xs text-slate-400 w-10 text-right">
                {total > 0 ? `${((entry.value / total) * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}