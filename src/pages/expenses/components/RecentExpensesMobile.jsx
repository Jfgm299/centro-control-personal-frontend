import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ACCOUNT_COLORS } from './FilterBar'
import ExpenseModal from './ExpenseModal'

const fmt = (v) => `€${Number(v).toFixed(2)}`

export default function RecentExpensesMobile({ expenses, onCreate, onUpdate, onRemove }) {
  const { t } = useTranslation('expenses')
  const [open, setOpen] = useState(true)
  const [modalExpense, setModalExpense] = useState(undefined)
  const [confirmId, setConfirmId] = useState(null)

  const sorted = [...expenses]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)

  const handleDelete = async (id) => {
    await onRemove(id)
    setConfirmId(null)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 shadow-lg">
        {/* Header — siempre visible */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 flex-1"
          >
            <span className="text-sm font-semibold text-white">{t('list.title')}</span>
            <svg
              className={`w-4 h-4 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* + siempre visible */}
          <button
            onClick={() => setModalExpense(null)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
            title={t('list.create')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Lista colapsable — scroll de 5 items */}
        {open && (
          <div
            className="overflow-y-auto divide-y divide-white/10 border-t border-white/10"
            style={{ maxHeight: 5 * 60 }} // ~60px por fila = 5 visibles
          >
            {sorted.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-6">{t('list.empty')}</p>
            ) : (
              sorted.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between px-4 py-3">
                  {/* Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: ACCOUNT_COLORS[expense.account] ?? '#94a3b8' }}
                    >
                      {expense.account[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{expense.name}</p>
                      <p className="text-xs text-white/50">
                        {expense.account} · {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Amount + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="font-mono font-semibold text-white text-sm">
                      {fmt(expense.quantity)}
                    </span>

                    {/* Edit */}
                    <button
                      onClick={() => setModalExpense(expense)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete / Confirm */}
                    {confirmId === expense.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-lg transition-all active:scale-95"
                        >
                          {t('list.confirmDelete')}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-0.5 text-xs font-medium text-white/70 border border-white/20 rounded-lg transition-all active:scale-95"
                        >
                          {t('modal.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(expense.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {modalExpense !== undefined && (
        <ExpenseModal
          expense={modalExpense}
          onClose={() => setModalExpense(undefined)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
