import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl p-3 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-mono font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function WorkoutCharts({ sessionData = [] }) {
  const { t } = useTranslation('gym')
  const last10 = sessionData.slice(-10)

  return (
    // h-full + flex-col so both charts split the available height equally
    <div className="h-full flex flex-col gap-4">
      {/* Exercises & sets per session */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex-shrink-0">{t('charts.exercisesTitle')}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              <Bar dataKey="exercises" name={t('charts.exercises')} fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="sets"      name={t('charts.sets')}      fill="#a5b4fc" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Duration per session */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex-shrink-0">{t('charts.durationTitle')}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v}m`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="minutes" name={t('charts.duration')}
                stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}