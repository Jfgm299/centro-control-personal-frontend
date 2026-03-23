import { useTranslation } from 'react-i18next'

function KPI({ label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl px-5 py-4 border flex flex-col gap-1 backdrop-blur-md shadow-sm transition-all hover:bg-white/10
      ${accent ? 'bg-white/10 text-white border-white/20' : 'bg-black/10 border-white/10'}`}>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-white/70' : 'text-white/50'}`}>
        {label}
      </span>
      <span className={`text-3xl font-bold font-mono tabular-nums ${accent ? 'text-white drop-shadow-md' : 'text-white/90'}`}>
        {value ?? '—'}
      </span>
      {sub && <span className={`text-xs font-medium ${accent ? 'text-white/60' : 'text-white/40'}`}>{sub}</span>}
    </div>
  )
}

export default function WorkoutKPIs({ kpis }) {
  const { t } = useTranslation('gym')
  if (!kpis) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      <KPI label={t('kpi.total')}    value={kpis.total}     sub={t('kpi.totalSub')}    accent />
      <KPI label={t('kpi.perWeek')}  value={kpis.perWeek}   sub={t('kpi.perWeekSub')} />
      <KPI label={t('kpi.avgTime')}  value={`${kpis.avgMinutes}min`} sub={t('kpi.avgTimeSub')} />
      <KPI label={t('kpi.streak')}   value={`${kpis.streak}d`}  sub={t('kpi.streakSub')} />
    </div>
  )
}