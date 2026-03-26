import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const ACCOUNTS = ['Revolut', 'Imagin']
const FREQUENCIES = [
  { value: 'WEEKLY',  labelKey: 'scheduled.freqWeekly' },
  { value: 'MONTHLY', labelKey: 'scheduled.freqMonthly' },
  { value: 'YEARLY',  labelKey: 'scheduled.freqYearly' },
]
const DEFAULT_ICONS = ['📺', '🎵', '☁️', '🏋️', '📰', '🎮', '🏠', '💳', '📱', '🚗', '💡', '🌐', '🏨', '✈️', '🎭', '🛒']

const empty = () => ({
  name: '', amount: '', account: 'Revolut',
  category: 'SUBSCRIPTION',
  frequency: 'MONTHLY',
  next_payment_date: '',
  is_active: true,
  icon: '📦', notes: '',
})

const inputCls = 'w-full h-[42px] px-3 text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30'
const labelCls = 'text-xs font-medium text-white/60'

export default function ScheduledExpenseModal({ item, onSave, onClose, isLoading }) {
  const { t } = useTranslation('expenses')
  const [form, setForm] = useState(empty())

  useEffect(() => {
    if (item) {
      setForm({
        name:              item.name ?? '',
        amount:            item.amount ?? '',
        account:           item.account ?? 'Revolut',
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
      frequency:         isOneTime ? 'MONTHLY' : form.frequency,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/10 border border-white/15 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-white/5 backdrop-blur-xl z-10">
          <h2 className="text-base font-semibold text-white">
            {item ? t('scheduled.modalTitleEdit') : t('scheduled.modalTitleCreate')}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Tipo */}
          <div className="flex gap-2">
            {[
              { value: 'SUBSCRIPTION', labelKey: 'scheduled.typeSubscription', descKey: 'scheduled.typeSubscriptionDesc' },
              { value: 'ONE_TIME',     labelKey: 'scheduled.typeOneTime',      descKey: 'scheduled.typeOneTimeDesc' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => set('category', opt.value)}
                className={`flex-1 py-3 px-3 rounded-xl border text-left transition-all
                  ${form.category === opt.value
                    ? 'bg-white/20 text-white border-white/30'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:bg-white/5'}`}>
                <p className="text-sm font-semibold">{t(opt.labelKey)}</p>
                <p className={`text-xs mt-0.5 ${form.category === opt.value ? 'text-white/60' : 'text-white/30'}`}>
                  {t(opt.descKey)}
                </p>
              </button>
            ))}
          </div>

          {/* Icon + Name */}
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('scheduled.icon')}</label>
              <select
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                className="w-16 h-[42px] text-center text-xl bg-white/5 border border-white/15 rounded-xl px-1 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {DEFAULT_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className={labelCls}>{t('scheduled.name')} *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder={isOneTime ? t('scheduled.namePlaceholderOneTime') : t('scheduled.namePlaceholderSub')}
                className={inputCls}
              />
            </div>
          </div>

          {/* Amount + Account */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('scheduled.amount')} *</label>
              <input
                required type="number" min="0.01" step="0.01"
                value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="9.99"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('modal.account')}</label>
              <select
                value={form.account}
                onChange={e => set('account', e.target.value)}
                className="w-full h-[42px] px-3 text-sm bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none"
              >
                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Frecuencia — solo suscripciones */}
          {!isOneTime && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('scheduled.frequency')}</label>
              <div className="flex gap-2">
                {FREQUENCIES.map(f => (
                  <button key={f.value} type="button" onClick={() => set('frequency', f.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                      ${form.frequency === f.value
                        ? 'bg-white/20 text-white border-white/30'
                        : 'border-white/10 text-white/50 hover:border-white/25 hover:bg-white/5'}`}>
                    {t(f.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              {isOneTime ? `${t('scheduled.paymentDate')} *` : t('scheduled.nextPayment')}
            </label>
            <input
              type="date"
              value={form.next_payment_date}
              onChange={e => set('next_payment_date', e.target.value)}
              required={isOneTime}
              className={inputCls}
            />
          </div>

          {/* Toggle activa — solo suscripciones */}
          {!isOneTime && (
            <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-white/80 font-medium">{t('scheduled.active')}</span>
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: form.is_active ? '#6366f1' : 'rgba(255,255,255,0.15)',
                  position: 'relative', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 2,
                  left: form.is_active ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s', display: 'block',
                }} />
              </button>
            </div>
          )}

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('scheduled.notes')}</label>
            <textarea
              value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder={isOneTime ? t('scheduled.notesPlaceholderOneTime') : t('scheduled.notesPlaceholderSub')}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-white/70 border border-white/15 rounded-xl hover:bg-white/10 transition-all">
              {t('modal.cancel')}
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-white/20 hover:bg-white/30 border border-white/25 text-white rounded-xl disabled:opacity-40 transition-all">
              {isLoading ? t('modal.saving') : item ? t('modal.save') : t('modal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
