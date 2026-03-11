import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Capacitor } from '@capacitor/core'
import { useBodyMeasures, useBodyMeasureMutations } from '../../hooks/useBodyMeasures'
import AddMeasureModal from './AddMeasureModal'

const IS_MOBILE = Capacitor.isNativePlatform() || window.innerWidth < 768

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-3 text-xs">
      <p className="font-semibold text-white/70 mb-2">{label.slice(0, 10)}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-mono font-bold text-white">
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
  const [historyOpen, setHistoryOpen] = useState(false)

  const sorted = [...measures].sort((a, b) => a.created_at.localeCompare(b.created_at))

  const chartData = sorted.map((m) => ({
    date: m.created_at,
    dateLabel: m.created_at.slice(0, 10),
    weight: m.weight_kg,
    fat: m.body_fat_percentage ?? undefined,
  }))

  const hasFat = sorted.some((m) => m.body_fat_percentage != null)
  const latest   = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]
  const weightDiff = latest && previous
    ? (latest.weight_kg - previous.weight_kg).toFixed(1)
    : null

  const handleAdd = async (payload) => {
    await create.mutateAsync(payload)
    setShowModal(false)
  }

  // Clases condicionales según plataforma
  const kpiPad     = IS_MOBILE ? 'px-4 py-3'   : 'px-5 py-4'
  const kpiNum     = IS_MOBILE ? 'text-xl'      : 'text-3xl'
  const kpiUnit    = IS_MOBILE ? 'text-xs'      : 'text-sm'

  return (
    <>
      <div className="bg-white/10 rounded-3xl border border-white/20 shadow-lg backdrop-blur-xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{t('body.title')}</h2>
            <p className="text-xs text-white/60 mt-0.5">{t('body.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all border border-white/10 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Latest KPIs */}
        {latest && (
          <div className="grid grid-cols-3 gap-3">
            <div className={`bg-white/20 rounded-2xl border border-white/30 shadow-inner ${kpiPad}`}>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">{t('body.currentWeight')}</p>
              <p className={`${kpiNum} font-bold font-mono text-white mt-1 drop-shadow-md`}>
                {latest.weight_kg}<span className={`${kpiUnit} font-normal text-white/60 ml-1`}>kg</span>
              </p>
            </div>
            {latest.body_fat_percentage != null && (
              <div className={`bg-black/20 rounded-2xl border border-white/10 ${kpiPad}`}>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{t('body.currentFat')}</p>
                <p className={`${kpiNum} font-bold font-mono text-white/90 mt-1`}>
                  {latest.body_fat_percentage}<span className={`${kpiUnit} font-normal text-white/50 ml-0.5`}>%</span>
                </p>
              </div>
            )}
            {weightDiff !== null && (
              <div className={`bg-black/20 rounded-2xl border border-white/10 ${kpiPad}`}>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{t('body.change')}</p>
                <p className={`${kpiNum} font-bold font-mono mt-1 ${parseFloat(weightDiff) < 0 ? 'text-green-400' : parseFloat(weightDiff) > 0 ? 'text-red-400' : 'text-white/80'}`}>
                  {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff}<span className={`${kpiUnit} font-normal text-white/40 ml-1`}>kg</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-white/40 text-sm">Loading…</div>
        ) : chartData.length > 1 ? (
          <div style={{ height: 220 }} className="bg-black/10 rounded-2xl p-4 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                  axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(0, 10).slice(5)} />
                <YAxis yAxisId="weight" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                  axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`}
                  domain={['dataMin - 2', 'dataMax + 2']} />
                {hasFat && (
                  <YAxis yAxisId="fat" orientation="right"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}%`} domain={['dataMin - 1', 'dataMax + 1']} />
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />
                <Line yAxisId="weight" type="monotone" dataKey="weight"
                  name={t('body.weight')} stroke="#60a5fa" strokeWidth={3}
                  dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                {hasFat && (
                  <Line yAxisId="fat" type="monotone" dataKey="fat"
                    name={t('body.fat')} stroke="#f97316" strokeWidth={2}
                    strokeDasharray="5 3" dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-white/40 text-center py-8 bg-black/10 rounded-2xl border border-white/5">
            {chartData.length === 0 ? t('body.empty') : t('body.needMore')}
          </p>
        )}

        {/* Historial — colapsable */}
        {sorted.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setHistoryOpen(v => !v)}
              className="flex items-center gap-2 w-full text-left"
            >
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex-1">
                {t('body.history') ?? 'Historial'}
              </span>
              <svg
                className={`w-4 h-4 text-white/40 transition-transform duration-200 ${historyOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {historyOpen && (
              <div className="flex flex-col divide-y divide-white/5 mt-3">
                {[...sorted].reverse().slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3 group">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {m.weight_kg} kg
                        {m.body_fat_percentage != null && (
                          <span className="text-white/40 font-normal ml-2 text-xs">· {m.body_fat_percentage}% grasa</span>
                        )}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(m.created_at).toLocaleDateString()}{m.notes && ` · ${m.notes}`}
                      </p>
                    </div>

                    {confirmId === m.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { remove.mutateAsync(m.id); setConfirmId(null) }}
                          className="px-3 py-1 text-xs font-bold bg-red-500/40 border border-red-500/50 text-white rounded-lg hover:bg-red-500/60 transition-all">
                          {t('common.confirm')}
                        </button>
                        <button onClick={() => setConfirmId(null)}
                          className="px-3 py-1 text-xs font-bold text-white/60 border border-white/20 rounded-lg hover:bg-white/10 transition-all">
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(m.id)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-400/20 transition-all border border-white/10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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