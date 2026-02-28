import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ACCOUNT_COLORS } from './FilterBar'
import ExpenseModal from './ExpenseModal'

const fmt = (v) => `€${Number(v).toFixed(2)}`

/**
 * RecentExpenses — listado con acciones de editar, borrar y crear.
 */
export default function RecentExpenses({ expenses, onCreate, onUpdate, onRemove }) {
  const { t } = useTranslation('expenses')

  const [modalExpense, setModalExpense] = useState(undefined) // undefined=cerrado, null=crear, objeto=editar
  const [confirmId, setConfirmId]       = useState(null)      // id pendiente de confirmar borrado

  const sorted = [...expenses]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)

  const handleDelete = async (id) => {
    await onRemove(id)
    setConfirmId(null)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">{t('list.title')}</h2>
          <button
            onClick={() => setModalExpense(null)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-all"
            title={t('list.create')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">{t('list.empty')}</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-50">
            {sorted.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-3 group">
                {/* Info */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: ACCOUNT_COLORS[expense.account] ?? '#94a3b8' }}
                  >
                    {expense.account[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{expense.name}</p>
                    <p className="text-xs text-slate-400">
                      {expense.account} · {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Amount + actions */}
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-slate-800 text-sm">
                    {fmt(expense.quantity)}
                  </span>

                  {/* Action buttons — visibles en hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit */}
                    <button
                      onClick={() => setModalExpense(expense)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                      title={t('list.edit')}
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
                          className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          {t('list.confirmDelete')}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-0.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                        >
                          {t('modal.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(expense.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title={t('list.delete')}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal create / edit */}
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