import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useReminderMutations } from '../../hooks/useReminderMutations'

const inputCls = 'w-full px-4 py-2.5 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner'
const selectCls = 'w-full px-4 py-2.5 h-[42px] text-sm bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner appearance-none'
const labelCls = 'text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block'

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

  const modalBody = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{t('reminders.addToCategory')}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">

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
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={selectCls}
              >
                {['high', 'medium', 'low'].map((p) => (
                  <option key={p} value={p} className="bg-slate-900">{t(`reminders.priority.${p}`)}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Categoría seleccionada */}
          {defaultCategory && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5 w-fit">
              <span className="text-[10px] text-white/40 uppercase font-bold">Cat:</span>
              <span style={{ color: defaultCategory.color }} className="text-xs font-black">{defaultCategory.name}</span>
            </div>
          )}

          {error && (
            <p className="text-xs font-bold text-red-200 bg-red-500/20 border border-red-500/30 px-4 py-3 rounded-xl shadow-lg">{error}</p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-3 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-white/70 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-sm"
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all border border-white/30 shadow-md"
            >
              {create.isPending ? t('status.saving') : t('reminders.addToCategory')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )

  return createPortal(modalBody, document.getElementById('modal-root'))
}