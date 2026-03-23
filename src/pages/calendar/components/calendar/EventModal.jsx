import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useCategories'
import { useCalendarMutations } from '../../hooks/useCalendarMutations'
import { useRoutineMutations } from '../../hooks/useRoutineMutations'
import clsx from 'clsx'
import CategorySelect from '../categories/CategorySelect'
import SelectInput from '../../../../components/ui/SelectInput'

const inputCls = 'w-full px-4 py-2.5 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner'

const REMINDER_OPTIONS = [5, 10, 15, 30, 60, 120, 1440]


function toDateOnly(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

function inputToISO(value, allDay) {
  if (!value) return ''
  if (allDay) return new Date(value + 'T00:00:00').toISOString()
  return new Date(value).toISOString()
}

function toDatetimeLocal(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}


const labelCls = 'text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block'

export default function EventModal({ isOpen, onClose, initialData }) {
  const { t } = useTranslation('calendar')
  const { data: categories = [] } = useCategories()
  const { create, update, remove } = useCalendarMutations()
  const { addException } = useRoutineMutations()

  const isRoutine = !!initialData?.routine_id
  const isEditing = !!initialData?.id && !isRoutine

  const defaultFormState = useMemo(() => ({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    category_id: initialData?.category_id ?? '',
    start_at: (initialData && (initialData.start_at || initialData.start)) 
              ? (initialData.all_day ? toDateOnly(initialData.start_at || initialData.start) : toDatetimeLocal(initialData.start_at || initialData.start))
              : '',
    end_at: (initialData && (initialData.end_at || initialData.end)) 
            ? (initialData.all_day ? toDateOnly(initialData.end_at || initialData.end) : toDatetimeLocal(initialData.end_at || initialData.end))
            : '',
    all_day: initialData?.all_day ?? false,
    color_override: initialData?.color_override ?? '',
    enable_dnd: initialData?.enable_dnd ?? false,
    reminder_minutes: initialData?.reminder_minutes ?? '',
  }), [initialData])

  const [form, setForm] = useState(defaultFormState)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState(null)

  const set = useCallback((key, val) => setForm((f) => ({ ...f, [key]: val })), [])

  const handleAllDayChange = useCallback((checked) => {
    setForm(f => ({
      ...f,
      all_day: checked,
      start_at: f.start_at ? (checked ? f.start_at.slice(0, 10) : f.start_at.slice(0, 10) + 'T00:00') : '',
      end_at:   f.end_at   ? (checked ? f.end_at.slice(0, 10)   : f.end_at.slice(0, 10)   + 'T00:00') : '',
    }))
  }, [])

  const buildPayload = useCallback(() => ({
    title:            form.title,
    description:      form.description      || undefined,
    category_id:      form.category_id      || undefined,
    start_at:         inputToISO(form.start_at, form.all_day),
    end_at:           inputToISO(form.end_at,   form.all_day),
    all_day:          form.all_day,
    color_override:   form.color_override   || undefined,
    enable_dnd:       form.enable_dnd,
    reminder_minutes: form.reminder_minutes || undefined,
  }), [form])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError(null)
    if (isRoutine) return
    try {
      if (isEditing) {
        await update.mutateAsync({ id: initialData.id, ...buildPayload() })
      } else {
        await create.mutateAsync(buildPayload())
      }
      onClose()
    } catch {
      setError(t('errors.saveEvent'))
    }
  }, [isRoutine, isEditing, initialData?.id, buildPayload, create, update, onClose, t])

  const handleDelete = useCallback(async () => {
    try { await remove.mutateAsync(initialData.id); onClose() }
    catch { setError(t('errors.deleteEvent')) }
  }, [initialData?.id, onClose, remove, t])

  const handleCancelOccurrence = useCallback(async () => {
    try {
      const originalDate = new Date(initialData.start_at).toISOString().slice(0, 10)
      await addException.mutateAsync({
        routineId:     initialData.routine_id,
        original_date: originalDate,
        action:        'cancelled',
      })
      onClose()
    } catch {
      setError(t('errors.deleteEvent'))
    }
  }, [addException, initialData?.routine_id, initialData?.start_at, onClose, t])

  const isPending = create.isPending || update.isPending

  const reminderOptions = useMemo(() => [
    { value: '', label: t('event.fields.reminderNone') },
    ...REMINDER_OPTIONS.map(m => ({
      value: m,
      label: t(`event.fields.reminderOptions.${m}`),
    }))
  ], [t])

  // Este useEffect solo resetea el formulario cuando se cierra el modal o cambia el evento (id)
  useEffect(() => {
    if (isOpen) {
      setForm(defaultFormState)
      setError(null)
      setConfirmDelete(false)
    }
  }, [isOpen, defaultFormState])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  const modalBody = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">
            {isRoutine ? `🔁 ${t('routines.title')}` : isEditing ? t('event.edit') : t('event.new')}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5 overflow-y-auto flex-1">
          
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.title')}</label>
            <input
              required autoFocus={!isRoutine}
              readOnly={isRoutine}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('event.fields.titlePlaceholder')}
              className={clsx(inputCls, isRoutine && 'opacity-60 cursor-default')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.description')}</label>
            <textarea
              readOnly={isRoutine}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={t('event.fields.descriptionPlaceholder')}
              rows={2}
              className={clsx(inputCls, 'resize-none', isRoutine && 'opacity-60 cursor-default')}
            />
          </div>

          {!isRoutine && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('event.fields.category')}</label>
              <CategorySelect
                categories={categories}
                value={form.category_id}
                onChange={(val) => set('category_id', val)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('event.fields.startAt')}</label>
              <input
                type={form.all_day ? 'date' : 'datetime-local'}
                value={form.start_at}
                onChange={(e) => set('start_at', e.target.value)}
                className={clsx(inputCls, isRoutine && 'opacity-60 cursor-default')}
                readOnly={isRoutine}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('event.fields.endAt')}</label>
              <input
                type={form.all_day ? 'date' : 'datetime-local'}
                value={form.end_at}
                onChange={(e) => set('end_at', e.target.value)}
                className={clsx(inputCls, isRoutine && 'opacity-60 cursor-default')}
                readOnly={isRoutine}
              />
            </div>
          </div>

          {!isRoutine && (
            <div className="flex gap-6 py-2">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={form.all_day}
                    onChange={(e) => handleAllDayChange(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-white/20 bg-white/5 transition-all checked:bg-white/20 checked:border-white/40 focus:outline-none"
                  />
                  <svg className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{t('event.fields.allDay')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={form.enable_dnd}
                    onChange={(e) => set('enable_dnd', e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-white/20 bg-white/5 transition-all checked:bg-white/20 checked:border-white/40 focus:outline-none"
                  />
                  <svg className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{t('event.fields.enableDnd')}</span>
              </label>
            </div>
          )}

          {isRoutine && (
            <p className="text-xs text-white/40 bg-white/5 px-3 py-2 rounded-xl border border-white/5 italic">
              {t('routines.readonlyNote')}
            </p>
          )}

          {error && (
            <p className="text-xs font-bold text-red-200 bg-red-500/20 border border-red-500/30 px-4 py-3 rounded-xl shadow-lg">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
            {isEditing && !confirmDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                {t('event.delete')}
              </button>
            )}
            
            {isRoutine && !confirmDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                {t('routines.cancelOccurrence')}
              </button>
            )}

            {confirmDelete && (
              <div className="flex items-center gap-3 bg-red-500/10 p-2 rounded-2xl border border-red-500/20 shadow-inner">
                <span className="text-[10px] font-black uppercase text-red-300 ml-2">{t('event.confirmDelete')}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={isRoutine ? handleCancelOccurrence : handleDelete}
                    disabled={isPending || addException.isPending}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-md">
                    {t('common:actions.confirm', { defaultValue: 'Si' })}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs font-bold text-white/50 hover:text-white transition-all">✕</button>
                </div>
              </div>
            )}

            <button
              type={isRoutine ? 'button' : 'submit'}
              onClick={isRoutine ? onClose : undefined}
              disabled={isPending}
              className="flex-1 max-w-[160px] py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all border border-white/20 shadow-lg drop-shadow-sm ml-auto"
            >
              {isPending ? t('status.saving') : isRoutine ? t('common:actions.close') : isEditing ? t('event.save') : t('event.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalBody, document.getElementById('modal-root'))
}
