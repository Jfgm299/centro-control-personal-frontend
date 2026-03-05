import { useState, useEffect } from 'react'

const ACCOUNTS = ['REVOLUT', 'IMAGIN']
const FREQUENCIES = [
  { value: 'WEEKLY',  label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'YEARLY',  label: 'Anual' },
]
const DEFAULT_ICONS = ['📺', '🎵', '☁️', '🏋️', '📰', '🎮', '🏠', '💳', '📱', '🚗', '💡', '🌐', '🏨', '✈️', '🎭', '🛒']

const empty = () => ({
  name: '', amount: '', account: 'REVOLUT',
  category: 'SUBSCRIPTION',
  frequency: 'MONTHLY',
  next_payment_date: '',
  is_active: true,
  icon: '📦', notes: '',
})

export default function ScheduledExpenseModal({ item, onSave, onClose, isLoading }) {
  const [form, setForm] = useState(empty())

  useEffect(() => {
    if (item) {
      setForm({
        name:              item.name ?? '',
        amount:            item.amount ?? '',
        account:           item.account ?? 'REVOLUT',
        category:          item.category ?? 'SUBSCRIPTION',
        frequency:         item.frequency ?? 'MONTHLY',
        next_payment_date: item.next_payment_date ?? '',
        is_active:         item.is_active ?? true,
        icon:              item.icon ?? '📦',
        notes:             item.notes ?? '',
      })
    }
  }, [item])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isOneTime = form.category === 'ONE_TIME'

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      name:              form.name.trim(),
      amount:            parseFloat(form.amount),
      account:           form.account,
      category:          form.category,
      frequency:         isOneTime ? 'MONTHLY' : form.frequency, // ignorado para ONE_TIME
      next_payment_date: form.next_payment_date || null,
      is_active:         form.is_active,
      icon:              form.icon,
      notes:             form.notes || null,
      custom_days:       null,
      color:             null,
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
            {item ? 'Editar' : 'Nuevo gasto programado'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Tipo — lo primero, condiciona el resto */}
          <div className="flex gap-2">
            {[
              { value: 'SUBSCRIPTION', label: '🔄 Suscripción',      desc: 'Cobro recurrente' },
              { value: 'ONE_TIME',     label: '📅 Gasto programado', desc: 'Pago único futuro' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => set('category', opt.value)}
                className={`flex-1 py-3 px-3 rounded-xl border text-left transition-all
                  ${form.category === opt.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className={`text-xs mt-0.5 ${form.category === opt.value ? 'text-slate-300' : 'text-slate-400'}`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Icon + Name */}
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
                placeholder={isOneTime ? 'Hotel, vuelo, reserva…' : 'Netflix, Spotify…'}
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

          {/* Frecuencia — solo para suscripciones */}
          {!isOneTime && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Frecuencia</label>
              <div className="flex gap-2">
                {FREQUENCIES.map(f => (
                  <button key={f.value} type="button" onClick={() => set('frequency', f.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                      ${form.frequency === f.value
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fecha de pago */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              {isOneTime ? 'Fecha del pago *' : 'Próximo pago'}
            </label>
            <input type="date" value={form.next_payment_date}
              onChange={e => set('next_payment_date', e.target.value)}
              required={isOneTime}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          {/* Activo — solo para suscripciones */}
          {!isOneTime && (
            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-700 font-medium">Activa</span>
              <button type="button" onClick={() => set('is_active', !form.is_active)}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Notas (opcional)</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} placeholder={isOneTime ? 'Ej. Reserva hotel Roma, check-in 12 marzo' : 'Ej. Plan familiar'}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40">
              {isLoading ? 'Guardando…' : item ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}