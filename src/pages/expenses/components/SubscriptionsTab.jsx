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

function KPIBadge({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color ?? '#0f172a' }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function ScheduledRow({ item, onEdit, onDelete }) {
  const days = daysUntil(item.next_payment_date)
  const urgent = days !== null && days <= 7

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm
      ${item.is_active ? 'bg-white border-gray-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>

      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${CATEGORY_COLORS[item.category]}18` }}>
        {item.icon ?? '📦'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${CATEGORY_COLORS[item.category]}18`, color: CATEGORY_COLORS[item.category] }}>
            {CATEGORY_LABELS[item.category]}
          </span>
          {!item.is_active && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">Pausado</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-slate-400">{item.account}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">{FREQUENCY_LABELS[item.frequency]}</span>
          {item.next_payment_date && (
            <>
              <span className="text-xs text-slate-400">·</span>
              <span className={`text-xs font-medium ${urgent ? 'text-red-500' : 'text-slate-500'}`}>
                {urgent ? `⚡ ${days === 0 ? 'Hoy' : `En ${days}d`}` : `Próximo: ${item.next_payment_date}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-slate-800">{fmt(item.amount)}</p>
        <p className="text-xs text-slate-400">/{FREQUENCY_LABELS[item.frequency].toLowerCase()}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(item)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function SubscriptionsTab() {
  const { scheduled, isLoading } = useScheduledExpenses()
  const { create, update, remove } = useScheduledMutations()
  const [modal, setModal] = useState(null) // null | 'create' | item object
  const [filter, setFilter] = useState('all') // all | subscription | recurring | installment

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
    if (window.confirm('¿Eliminar este gasto programado?')) {
      await remove.mutateAsync(id)
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIBadge label="Gasto mensual" value={fmt(stats.monthlyTotal)} sub="Activos" color="#6366f1" />
        <KPIBadge label="Gasto anual" value={fmt(stats.yearlyTotal)} sub="Proyectado" />
        <KPIBadge label="Activos" value={stats.activeCount} sub="Gastos programados" />
        <KPIBadge label="Próximo pago"
          value={stats.upcoming[0] ? stats.upcoming[0].icon + ' ' + stats.upcoming[0].name : '—'}
          sub={stats.upcoming[0]?.next_payment_date ?? ''} />
      </div>

      {/* Header + filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'subscription', 'recurring', 'installment'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}>
              {f === 'all' ? 'Todos' : CATEGORY_LABELS[f]}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all">
          + Añadir
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-300">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">No hay gastos programados aún</p>
          <button onClick={() => setModal('create')}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-700 transition-all">
            Añadir el primero
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Upcoming banner */}
          {stats.upcoming.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-2">
              <p className="text-xs font-semibold text-amber-700 mb-2">⏰ Próximos pagos</p>
              <div className="flex gap-3 flex-wrap">
                {stats.upcoming.map(s => {
                  const days = daysUntil(s.next_payment_date)
                  return (
                    <div key={s.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-amber-100">
                      <span>{s.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-slate-700">{s.name}</p>
                        <p className="text-xs text-amber-600">
                          {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`} · {fmt(s.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {filtered.map(item => (
            <ScheduledRow key={item.id} item={item}
              onEdit={setModal}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
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