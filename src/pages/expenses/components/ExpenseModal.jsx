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

export default function ExpenseModal({ expense, onClose, onCreate, onUpdate }) {
  const { t } = useTranslation('expenses')
  const isEditing = !!expense

  const [name, setName]       = useState(expense?.name     ?? '')
  const [quantity, setQuantity] = useState(expense?.quantity ?? '')
  const [account, setAccount] = useState(expense?.account  ?? ACCOUNTS[0])
  const [error, setError]     = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cierra con Escape
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
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {isEditing ? t('modal.titleEdit') : t('modal.titleCreate')}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
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
            <label className="text-xs font-medium text-slate-600">{t('modal.name')}</label>
            <input
              type="text"
              required
              autoFocus
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('modal.namePlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('modal.quantity')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('modal.account')}</label>
            <div className="flex gap-2">
              {ACCOUNTS.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccount(acc)}
                  className={`
                    flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${account === acc
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }
                  `}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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