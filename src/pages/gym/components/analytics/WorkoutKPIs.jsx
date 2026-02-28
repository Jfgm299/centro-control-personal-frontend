import { useTranslation } from 'react-i18next'

function KPI({ label, value, sub, accent }) {
  return (
    <div className={`rounded-xl px-4 py-3 border flex flex-col gap-0.5
      ${accent ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
      <span className={`text-xs font-semibold uppercase tracking-widest ${accent ? 'text-slate-400' : 'text-slate-400'}`}>
        {label}
      </span>
      <span className={`text-2xl font-bold font-mono tabular-nums ${accent ? 'text-white' : 'text-slate-900'}`}>
        {value ?? '—'}
      </span>
      {sub && <span className={`text-xs ${accent ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</span>}
    </div>
  )
}

export default function WorkoutKPIs({ kpis }) {
  const { t } = useTranslation('gym')
  if (!kpis) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      <KPI label={t('kpi.total')}    value={kpis.total}     sub={t('kpi.totalSub')}    accent />
      <KPI label={t('kpi.perWeek')}  value={kpis.perWeek}   sub={t('kpi.perWeekSub')} />
      <KPI label={t('kpi.avgTime')}  value={`${kpis.avgMinutes}min`} sub={t('kpi.avgTimeSub')} />
      <KPI label={t('kpi.streak')}   value={`${kpis.streak}d`}  sub={t('kpi.streakSub')} />
    </div>
  )
}