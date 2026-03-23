import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-3 text-xs">
      <p className="font-semibold text-white/70 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-mono font-bold text-white">{p.value}</span>
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
    <div className="h-full flex flex-col gap-6">
      {/* Exercises & sets per session */}
      <div className="flex-1 bg-white/10 rounded-3xl border border-white/20 shadow-lg backdrop-blur-xl p-6 flex flex-col">
        <h3 className="text-base font-bold text-white mb-4 flex-shrink-0">{t('charts.exercisesTitle')}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />
              <Bar dataKey="exercises" name={t('charts.exercises')} fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="sets"      name={t('charts.sets')}      fill="#06b6d4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Duration per session */}
      <div className="flex-1 bg-white/10 rounded-3xl border border-white/20 shadow-lg backdrop-blur-xl p-6 flex flex-col">
        <h3 className="text-base font-bold text-white mb-4 flex-shrink-0">{t('charts.durationTitle')}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${v}m`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />
              <Line type="monotone" dataKey="minutes" name={t('charts.duration')}
                stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}