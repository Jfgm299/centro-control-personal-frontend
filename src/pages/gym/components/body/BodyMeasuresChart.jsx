import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useBodyMeasures, useBodyMeasureMutations } from '../../hooks/useBodyMeasures'
import AddMeasureModal from './AddMeasureModal'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl p-3 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-mono font-semibold text-slate-800">
            {p.value}{p.dataKey === 'weight' ? ' kg' : '%'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function BodyMeasuresChart() {
  const { t } = useTranslation('gym')
  const { data: measures = [], isLoading } = useBodyMeasures()
  const { create, remove } = useBodyMeasureMutations()
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  const sorted = [...measures].sort((a, b) => a.created_at.localeCompare(b.created_at))

  const chartData = sorted.map((m) => ({
    date: m.created_at.slice(0, 10),
    weight: m.weight_kg,
    fat: m.body_fat_percent ?? undefined,
  }))

  const hasFat = sorted.some((m) => m.body_fat_percent != null)

  // Latest measurement for KPIs
  const latest  = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]
  const weightDiff = latest && previous
    ? (latest.weight_kg - previous.weight_kg).toFixed(1)
    : null

  const handleAdd = async (payload) => {
    await create.mutateAsync(payload)
    setShowModal(false)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t('body.title')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('body.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Latest KPIs */}
        {latest && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{t('body.currentWeight')}</p>
              <p className="text-2xl font-bold font-mono text-white mt-0.5">{latest.weight_kg}<span className="text-sm font-normal text-slate-400 ml-1">kg</span></p>
            </div>
            {latest.body_fat_percent != null && (
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{t('body.currentFat')}</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{latest.body_fat_percent}<span className="text-sm font-normal text-slate-400 ml-0.5">%</span></p>
              </div>
            )}
            {weightDiff !== null && (
              <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{t('body.change')}</p>
                <p className={`text-2xl font-bold font-mono mt-0.5 ${parseFloat(weightDiff) < 0 ? 'text-green-500' : parseFloat(weightDiff) > 0 ? 'text-red-500' : 'text-slate-900'}`}>
                  {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff}<span className="text-sm font-normal text-slate-400 ml-1">kg</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>
        ) : chartData.length > 1 ? (
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
                <YAxis yAxisId="weight" tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`}
                  domain={['dataMin - 2', 'dataMax + 2']} />
                {hasFat && (
                  <YAxis yAxisId="fat" orientation="right"
                    tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}%`} domain={['dataMin - 1', 'dataMax + 1']} />
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Line yAxisId="weight" type="monotone" dataKey="weight"
                  name={t('body.weight')} stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                {hasFat && (
                  <Line yAxisId="fat" type="monotone" dataKey="fat"
                    name={t('body.fat')} stroke="#f97316" strokeWidth={2}
                    strokeDasharray="5 3" dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">
            {chartData.length === 0 ? t('body.empty') : t('body.needMore')}
          </p>
        )}

        {/* Recent measurements list */}
        {sorted.length > 0 && (
          <div className="flex flex-col divide-y divide-slate-50">
            {[...sorted].reverse().slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2.5 group">
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.weight_kg} kg
                    {m.body_fat_percent != null && (
                      <span className="text-slate-400 font-normal ml-2 text-xs">· {m.body_fat_percent}% grasa</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}{m.notes && ` · ${m.notes}`}</p>
                </div>

                {confirmId === m.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { remove.mutateAsync(m.id); setConfirmId(null) }}
                      className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                      {t('common.confirm')}
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="px-2 py-0.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(m.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddMeasureModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          isLoading={create.isPending}
        />
      )}
    </>
  )
}