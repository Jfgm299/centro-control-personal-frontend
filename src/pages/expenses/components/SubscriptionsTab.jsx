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

function ScheduledRow({ item, onEdit, onDelete }) {
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
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/10
      ${item.is_active ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/10 opacity-60'}`}>

      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: isOneTime ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)' }}>
        {item.icon ?? (isOneTime ? '📅' : '🔄')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm">{item.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${isOneTime ? 'bg-amber-500/10 text-amber-300' : 'bg-indigo-500/10 text-indigo-300'}`}>
            {isOneTime ? t('scheduled.typeOneTimeShort') : t('scheduled.typeSubscriptionShort')}
          </span>
          {!item.is_active && !isOneTime && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
              {t('scheduled.paused')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-white/50">{item.account}</span>
          {!isOneTime && (
            <><span className="text-xs text-white/50">·</span>
            <span className="text-xs text-white/50">{freqLabel[item.frequency] ?? item.frequency}</span></>
          )}
          {item.next_payment_date && (
            <><span className="text-xs text-white/50">·</span>
            <span className={`text-xs font-medium ${urgent ? 'text-red-400' : 'text-white/70'}`}>
              {urgent ? `⚡ ${urgentLabel}` : item.next_payment_date}
            </span></>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold text-white">{fmt(item.amount)}</p>
        {!isOneTime && (
          <p className="text-xs text-white/50">/{freqLabel[item.frequency]?.toLowerCase()}</p>
        )}
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(item)}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function GlassCard({ children, className='' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 shadow-lg p-5 ${className}`}>
      {children}
    </div>
  )
}

export default function SubscriptionsTab() {
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
    <div className="flex items-center justify-center h-64 text-white/50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
            {t('scheduled.kpiMonthly')}
          </p>
          <p className="text-2xl font-bold mt-1 text-indigo-300">{fmt(stats.monthlyTotal)}</p>
          <p className="text-xs text-white/50 mt-0.5">{fmt(stats.yearlyTotal)} {t('scheduled.kpiYearlySub')}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
            {t('scheduled.kpiOneTime')}
          </p>
          <p className="text-2xl font-bold mt-1 text-amber-300">
            {fmt(scheduled.filter(s => s.category === 'ONE_TIME' && s.is_active).reduce((sum, s) => sum + s.amount, 0))}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            {scheduled.filter(s => s.category === 'ONE_TIME' && s.is_active).length} {t('scheduled.kpiOneTimeSub')}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
            {t('scheduled.kpiNext')}
          </p>
          <p className="text-lg font-bold mt-1 text-white">
            {stats.upcoming[0] ? `${stats.upcoming[0].icon} ${stats.upcoming[0].name}` : '—'}
          </p>
          <p className="text-xs text-white/50 mt-0.5">{stats.upcoming[0]?.next_payment_date ?? ''}</p>
        </GlassCard>
      </div>

      {/* Upcoming banner */}
      {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-300 mb-3">⏰ {t('scheduled.upcomingWeek')}</p>
          <div className="flex gap-3 flex-wrap">
            {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).map(s => {
              const days = daysUntil(s.next_payment_date)
              const label = days === 0 ? t('scheduled.today') : days === 1 ? t('scheduled.tomorrow') : t('scheduled.inDays', { days })
              return (
                <div key={s.id} className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 border border-white/10">
                  <span>{s.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-white/80">{s.name}</p>
                    <p className="text-xs text-amber-400">{label} · {fmt(s.amount)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: 'all',           label: t('scheduled.filterAll') },
            { key: 'subscriptions', label: `🔄 ${t('scheduled.filterSubs')}` },
            { key: 'one_time',      label: `📅 ${t('scheduled.filterOneTime')}` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                ${filter === f.key ? 'bg-white/20 text-white border-transparent' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-all">
          + {t('scheduled.addNew')}
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <p className="text-4xl mb-3">{filter === 'one_time' ? '📅' : '🔄'}</p>
          <p className="text-sm">{t('scheduled.empty')}</p>
          <button onClick={() => setModal('create')}
            className="mt-4 px-4 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20">
            {t('scheduled.emptyAction')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => (
            <ScheduledRow key={item.id} item={item} onEdit={setModal} onDelete={handleDelete} />
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
