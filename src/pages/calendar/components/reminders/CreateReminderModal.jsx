import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReminderMutations } from '../../hooks/useReminderMutations'

const inputCls  = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-800 placeholder-gray-400'
const selectCls = 'w-full px-3 py-2.5 h-[42px] text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-700'
const labelCls  = 'text-xs font-medium text-gray-500 mb-1 block'

export default function CreateReminderModal({ isOpen, onClose, defaultCategory }) {
  const { t }      = useTranslation('calendar')
  const { create } = useReminderMutations()

  const [title,    setTitle]    = useState('')
  const [priority, setPriority] = useState('medium')
  const [error,    setError]    = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await create.mutateAsync({
        title,
        priority,
        category_id: defaultCategory?.id ?? undefined,
      })
      setTitle(''); setPriority('medium')
      onClose()
    } catch {
      setError(t('errors.saveEvent'))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{t('reminders.addToCategory')}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.title')}</label>
            <input
              required autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('event.fields.titlePlaceholder')}
              className={inputCls}
            />
          </div>

          {/* Prioridad */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('reminders.priority.label')}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={selectCls}
            >
              {['high', 'medium', 'low'].map((p) => (
                <option key={p} value={p}>{t(`reminders.priority.${p}`)}</option>
              ))}
            </select>
          </div>

          {/* Categoría seleccionada */}
          {defaultCategory && (
            <p className="text-xs text-gray-400">
              Categoría: <span style={{ color: defaultCategory.color }} className="font-medium">{defaultCategory.name}</span>
            </p>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {create.isPending ? t('status.saving') : t('reminders.addToCategory')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}