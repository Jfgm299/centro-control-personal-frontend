import { useState } from 'react'
import {
  useScheduledExpenses,
  useScheduledMutations,
  aggregateScheduled,
  daysUntil,
  FREQUENCY_LABELS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../hooks/useScheduledExpenses'
import ScheduledExpenseModal from './ScheduledExpenseModal'

const fmt = (v) => `€${Number(v).toFixed(2)}`

function ScheduledCard({ item, onEdit, onDelete }) {
  const days = daysUntil(item.next_payment_date)
  const urgent = days !== null && days <= 7

  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-start gap-3
      ${item.is_active ? 'border-gray-100' : 'border-slate-100 opacity-60'}`}>

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${CATEGORY_COLORS[item.category]}18` }}>
        {item.icon ?? '📦'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {item.account} · {FREQUENCY_LABELS[item.frequency]}
            </p>
          </div>
          <p className="font-bold text-slate-800 text-sm flex-shrink-0">{fmt(item.amount)}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${CATEGORY_COLORS[item.category]}18`, color: CATEGORY_COLORS[item.category] }}>
              {CATEGORY_LABELS[item.category]}
            </span>
            {item.next_payment_date && (
              <span className={`text-xs font-medium ${urgent ? 'text-red-500' : 'text-slate-400'}`}>
                {urgent
                  ? `⚡ ${days === 0 ? 'Hoy' : `${days}d`}`
                  : item.next_payment_date}
              </span>
            )}
            {!item.is_active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">Pausado</span>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
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
  const { scheduled, isLoading } = useScheduledExpenses()
  const { create, update, remove } = useScheduledMutations()
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('all')

  const stats = aggregateScheduled(scheduled)

  const filtered = scheduled.filter(s =>
    filter === 'all' ? true : s.category === filter
  )

  const handleSave = async (payload) => {
    if (payload.id) await update.mutateAsync(payload)
    else await create.mutateAsync(payload)
    setModal(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar?')) await remove.mutateAsync(id)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-32 text-slate-400">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-3">

      {/* KPIs 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Mensual', value: fmt(stats.monthlyTotal), color: '#6366f1' },
          { label: 'Anual',   value: fmt(stats.yearlyTotal)  },
          { label: 'Activos', value: stats.activeCount       },
          { label: 'Próximo', value: stats.upcoming[0]?.icon + ' ' + (stats.upcoming[0]?.name ?? '—') },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-3">
            <p className="text-xs text-slate-400">{kpi.label}</p>
            <p className="font-bold text-sm mt-0.5 truncate" style={{ color: kpi.color ?? '#0f172a' }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming banner */}
      {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">⏰ Esta semana</p>
          <div className="flex flex-col gap-2">
            {stats.upcoming.filter(s => daysUntil(s.next_payment_date) <= 7).map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{s.name}</span>
                </div>
                <span className="text-xs text-amber-600 font-medium">
                  {daysUntil(s.next_payment_date) === 0 ? 'Hoy' : `${daysUntil(s.next_payment_date)}d`} · {fmt(s.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter pills + Add button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'subscription', 'recurring', 'installment'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
            {f === 'all' ? 'Todos' : CATEGORY_LABELS[f]}
          </button>
        ))}
        <button onClick={() => setModal('create')}
          className="flex-shrink-0 ml-auto px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full">
          + Añadir
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-300">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">Sin gastos programados</p>
          <button onClick={() => setModal('create')}
            className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs rounded-xl">
            Añadir
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => (
            <ScheduledCard key={item.id} item={item}
              onEdit={setModal}
              onDelete={handleDelete} />
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