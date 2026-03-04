import { useState, useEffect } from 'react'
import { FREQUENCY_LABELS, CATEGORY_LABELS } from '../hooks/useScheduledExpenses'

const ACCOUNTS = ['REVOLUT', 'IMAGIN']
const FREQUENCIES = ['monthly', 'yearly', 'weekly', 'custom']
const CATEGORIES = ['subscription', 'recurring', 'installment']
const DEFAULT_ICONS = ['📺', '🎵', '☁️', '🏋️', '📰', '🎮', '🏠', '💳', '📱', '🚗', '💡', '🌐']

const empty = () => ({
  name: '', amount: '', account: 'REVOLUT',
  frequency: 'monthly', category: 'subscription',
  next_payment_date: '', is_active: true,
  icon: '📦', color: '#6366f1', notes: '', custom_days: '',
})

export default function ScheduledExpenseModal({ item, onSave, onClose, isLoading }) {
  const [form, setForm] = useState(empty())

  useEffect(() => {
    if (item) {
      setForm({
        name:               item.name ?? '',
        amount:             item.amount ?? '',
        account:            item.account ?? 'REVOLUT',
        frequency:          item.frequency ?? 'monthly',
        category:           item.category ?? 'subscription',
        next_payment_date:  item.next_payment_date ?? '',
        is_active:          item.is_active ?? true,
        icon:               item.icon ?? '📦',
        color:              item.color ?? '#6366f1',
        notes:              item.notes ?? '',
        custom_days:        item.custom_days ?? '',
      })
    }
  }, [item])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      amount:      parseFloat(form.amount),
      custom_days: form.custom_days ? parseInt(form.custom_days) : null,
      next_payment_date: form.next_payment_date || null,
      notes:       form.notes || null,
    }
    if (item?.id) payload.id = item.id
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-slate-800">
            {item ? 'Editar gasto programado' : 'Nuevo gasto programado'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Icon picker + Name */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Icono</label>
              <select value={form.icon} onChange={e => set('icon', e.target.value)}
                className="w-16 text-center text-xl border border-slate-200 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900">
                {DEFAULT_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Nombre *</label>
              <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Netflix, Spotify…"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>

          {/* Amount + Account */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Importe (€) *</label>
              <input required type="number" min="0.01" step="0.01" value={form.amount}
                onChange={e => set('amount', e.target.value)} placeholder="9.99"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Cuenta</label>
              <select value={form.account} onChange={e => set('account', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900">
                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Tipo</label>
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => set('category', c)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
                    ${form.category === c ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Frecuencia</label>
            <div className="flex gap-2 flex-wrap">
              {FREQUENCIES.map(f => (
                <button key={f} type="button" onClick={() => set('frequency', f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${form.frequency === f ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                  {FREQUENCY_LABELS[f]}
                </button>
              ))}
            </div>
            {form.frequency === 'custom' && (
              <input type="number" min="1" value={form.custom_days}
                onChange={e => set('custom_days', e.target.value)} placeholder="Cada X días"
                className="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
            )}
          </div>

          {/* Next payment date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Próximo pago</label>
            <input type="date" value={form.next_payment_date} onChange={e => set('next_payment_date', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-700 font-medium">Activo</span>
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-indigo-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Notas (opcional)</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} placeholder="Ej. Familiar, compartido con…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-all">
              {isLoading ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}