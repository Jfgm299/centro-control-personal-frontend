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
    <div className={`bg-white rounded-2xl border p-4 flex items-start gap-3
      ${item.is_active ? 'border-gray-100' : 'border-slate-100 opacity-60'}`}>

      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: isOneTime ? '#f59e0b18' : '#6366f118' }}>
        {item.icon ?? (isOneTime ? '📅' : '🔄')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {item.account}
              {!isOneTime && ` · ${freqLabel[item.frequency] ?? item.frequency}`}
            </p>
          </div>
          <p className="font-bold text-slate-800 text-sm flex-shrink-0">{fmt(item.amount)}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${isOneTime ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isOneTime ? t('scheduled.typeOneTimeShort') : t('scheduled.typeSubscriptionShort')}
            </span>
            {item.next_payment_date && (
              <span className={`text-xs font-medium ${urgent ? 'text-red-500' : 'text-slate-400'}`}>
                {urgent ? `⚡ ${urgentLabel}` : item.next_payment_date}
              </span>
            )}
            {!item.is_active && !isOneTime && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                {t('scheduled.paused')}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
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
      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  const oneTimePending = scheduled.filter(s => s.category === 'ONE_TIME' && s.is_active)

  return (
    <div className="flex flex-col gap-3">

      {/* KPIs 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-3">
          <p className="text-xs text-slate-400">{t('scheduled.kpiMonthly')}</p>
          <p className="font-bold text-sm mt-0.5 text-indigo-600">{fmt(stats.monthlyTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3">
          <p className="text-xs text-slate-400">{t('scheduled.kpiOneTime')}</p>
          <p className="font-bold text-sm mt-0.5 text-amber-500">
            {fmt(oneTimePending.reduce((s, i) => s + i.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 col-span-2">
          <p className="text-xs text-slate-400">{t('scheduled.kpiNext')}</p>
          <p className="font-bold text-sm mt-0.5 truncate">
            {stats.upcoming[0]
              ? `${stats.upcoming[0].icon} ${stats.upcoming[0].name} · ${fmt(stats.upcoming[0].amount)}`
              : '—'}
          </p>
        </div>
      </div>

      {/* Upcoming urgentes */}
      {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">⏰ {t('scheduled.upcomingWeek')}</p>
          {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).map(s => {
            const days = daysUntil(s.next_payment_date)
            const label = days === 0 ? t('scheduled.today') : days === 1 ? t('scheduled.tomorrow') : t('scheduled.inDays', { days })
            return (
              <div key={s.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{s.name}</span>
                </div>
                <span className="text-xs text-amber-600 font-medium">
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
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filter === f.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setModal('create')}
          className="flex-shrink-0 ml-auto px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full">
          + {t('scheduled.addNew')}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-300">
          <p className="text-3xl mb-2">{filter === 'one_time' ? '📅' : '🔄'}</p>
          <p className="text-sm">{t('scheduled.empty')}</p>
          <button onClick={() => setModal('create')}
            className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs rounded-xl">
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