import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useScheduledExpenses,
  useScheduledMutations,
  aggregateScheduled,
  daysUntil,
} from '../hooks/useScheduledExpenses'
import ScheduledExpenseModal from './ScheduledExpenseModal'

const fmt = (v) => `€${Number(v).toFixed(2)}`

function ScheduledCard({ item, onEdit, onDelete }) {
  const { t } = useTranslation('expenses')
  const days = daysUntil(item.next_payment_date)
  const urgent = days !== null && days <= 7
  const isOneTime = item.category === 'ONE_TIME'

  const freqLabel = {
    WEEKLY:  t('scheduled.freqWeekly'),
    MONTHLY: t('scheduled.freqMonthly'),
    YEARLY:  t('scheduled.freqYearly'),
  }

  const urgentLabel = days === 0
    ? t('scheduled.today')
    : days === 1
    ? t('scheduled.tomorrow')
    : t('scheduled.inDays', { days })

  return (
    <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 p-4 flex items-start gap-3
      ${!item.is_active && 'opacity-60'}`}>

      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: isOneTime ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)' }}>
        {item.icon ?? (isOneTime ? '📅' : '🔄')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{item.name}</p>
            <p className="text-xs text-white/50 mt-0.5">
              {item.account}
              {!isOneTime && ` · ${freqLabel[item.frequency] ?? item.frequency}`}
            </p>
          </div>
          <p className="font-bold text-white text-sm flex-shrink-0">{fmt(item.amount)}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${isOneTime ? 'bg-amber-500/10 text-amber-300' : 'bg-indigo-500/10 text-indigo-300'}`}>
              {isOneTime ? t('scheduled.typeOneTimeShort') : t('scheduled.typeSubscriptionShort')}
            </span>
            {item.next_payment_date && (
              <span className={`text-xs font-medium ${urgent ? 'text-red-400' : 'text-white/60'}`}>
                {urgent ? `⚡ ${urgentLabel}` : item.next_payment_date}
              </span>
            )}
            {!item.is_active && !isOneTime && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                {t('scheduled.paused')}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GlassCard({ children, className='' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 shadow-lg p-3 ${className}`}>
      {children}
    </div>
  )
}

export default function SubscriptionsTabMobile() {
  const { t } = useTranslation('expenses')
  const { scheduled, isLoading } = useScheduledExpenses()
  const { create, update, remove } = useScheduledMutations()
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('all')

  const stats = aggregateScheduled(scheduled)

  const filtered = scheduled.filter(s =>
    filter === 'all' ? true :
    filter === 'subscriptions' ? s.category === 'SUBSCRIPTION' :
    s.category === 'ONE_TIME'
  )

  const handleSave = async (payload) => {
    if (payload.id) await update.mutateAsync(payload)
    else await create.mutateAsync(payload)
    setModal(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('list.confirmDelete'))) await remove.mutateAsync(id)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  )

  const oneTimePending = scheduled.filter(s => s.category === 'ONE_TIME' && s.is_active)

  return (
    <div className="flex flex-col gap-3">

      {/* KPIs 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        <GlassCard>
          <p className="text-xs text-white/60">{t('scheduled.kpiMonthly')}</p>
          <p className="font-bold text-sm mt-0.5 text-indigo-300">{fmt(stats.monthlyTotal)}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-white/60">{t('scheduled.kpiOneTime')}</p>
          <p className="font-bold text-sm mt-0.5 text-amber-300">
            {fmt(oneTimePending.reduce((s, i) => s + i.amount, 0))}
          </p>
        </GlassCard>
        <GlassCard className="col-span-2">
          <p className="text-xs text-white/60">{t('scheduled.kpiNext')}</p>
          <p className="font-bold text-sm mt-0.5 truncate text-white">
            {stats.upcoming[0]
              ? `${stats.upcoming[0].icon} ${stats.upcoming[0].name} · ${fmt(stats.upcoming[0].amount)}`
              : '—'}
          </p>
        </GlassCard>
      </div>

      {/* Upcoming urgentes */}
      {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
          <p className="text-xs font-semibold text-amber-300 mb-2">⏰ {t('scheduled.upcomingWeek')}</p>
          {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).map(s => {
            const days = daysUntil(s.next_payment_date)
            const label = days === 0 ? t('scheduled.today') : days === 1 ? t('scheduled.tomorrow') : t('scheduled.inDays', { days })
            return (
              <div key={s.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="text-xs font-medium text-white/80">{s.name}</span>
                </div>
                <span className="text-xs text-amber-400 font-medium">
                  {label} · {fmt(s.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Filtros + Añadir */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all',           label: t('scheduled.filterAll') },
          { key: 'subscriptions', label: `🔄 ${t('scheduled.filterSubs')}` },
          { key: 'one_time',      label: `📅 ${t('scheduled.filterOneTime')}` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border
              ${filter === f.key ? 'bg-white/20 text-white border-transparent' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setModal('create')}
          className="flex-shrink-0 ml-auto px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full transition-all active:scale-95">
          + {t('scheduled.addNew')}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-white/30">
          <p className="text-3xl mb-2">{filter === 'one_time' ? '📅' : '🔄'}</p>
          <p className="text-sm">{t('scheduled.empty')}</p>
          <button onClick={() => setModal('create')}
            className="mt-3 px-4 py-2 bg-white/10 text-white text-xs rounded-xl transition-all active:scale-95">
            {t('scheduled.emptyAction')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => (
            <ScheduledCard key={item.id} item={item} onEdit={setModal} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal && (
        <ScheduledExpenseModal
          item={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          isLoading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}
