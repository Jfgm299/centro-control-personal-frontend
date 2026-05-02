/**
 * ExpenseModal — modal compartido para crear y editar gastos.
 * Props:
 *   expense   → objeto a editar (null = modo creación)
 *   onClose   → callback para cerrar
 *   onCreate  → mutationFn de create
 *   onUpdate  → mutationFn de update
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const ACCOUNTS = ['Revolut', 'Imagin']

const inputCls = 'w-full px-3 py-2.5 text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all'
const labelCls = 'text-xs font-medium text-white/60'

export default function ExpenseModal({ expense, onClose, onCreate, onUpdate }) {
  const { t } = useTranslation('expenses')
  const isEditing = !!expense

  const [name, setName]         = useState(expense?.name     ?? '')
  const [quantity, setQuantity] = useState(expense?.quantity ?? '')
  const [account, setAccount]   = useState(expense?.account  ?? null)
  const [error, setError]       = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const payload = { name, quantity: parseFloat(quantity), account }
      if (isEditing) {
        await onUpdate({ id: expense.id, ...payload })
      } else {
        await onCreate(payload)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail ?? t('modal.errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/10 border border-white/15 shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">
            {isEditing ? t('modal.titleEdit') : t('modal.titleCreate')}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('modal.name')}</label>
            <input
              type="text"
              required
              autoFocus
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('modal.namePlaceholder')}
              className={inputCls}
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('modal.quantity')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">€</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
              />
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('modal.account')}</label>
            <div className="flex gap-2">
              {ACCOUNTS.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccount(acc)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${account === acc
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:bg-white/10'
                    }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-white/70 border border-white/15 rounded-xl hover:bg-white/10 transition-all"
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-semibold bg-white/20 hover:bg-white/30 border border-white/25 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? t('modal.saving')
                : isEditing ? t('modal.save') : t('modal.create')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
