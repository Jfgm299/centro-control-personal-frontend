import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useCategories'
import { useCalendarMutations } from '../../hooks/useCalendarMutations'
import { useRoutineMutations } from '../../hooks/useRoutineMutations'

const REMINDER_OPTIONS = [5, 10, 15, 30, 60, 120, 1440]

function toDatetimeLocal(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-800 placeholder-gray-400'
const selectCls = 'w-full px-3 py-2.5 h-[42px] text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-700'
const labelCls = 'text-xs font-medium text-gray-500 mb-1 block'

export default function EventModal({ isOpen, onClose, initialData }) {
  const { t } = useTranslation('calendar')
  const { data: categories = [] } = useCategories()
  const { create, update, remove } = useCalendarMutations()
  const { addException } = useRoutineMutations()

  const isRoutine = !!initialData?.routine_id
  const isEditing = !!initialData?.id && !isRoutine

  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    start_at: '', end_at: '', all_day: false,
    color_override: '', enable_dnd: false, reminder_minutes: '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      const allDay = initialData.all_day ?? false
      const toVal = allDay ? toDateOnly : toDatetimeLocal
      setForm({
        title:            initialData.title            ?? '',
        description:      initialData.description      ?? '',
        category_id:      initialData.category_id      ?? '',
        start_at:         toVal(initialData.start_at ?? initialData.start),
        end_at:           toVal(initialData.end_at   ?? initialData.end),
        all_day:          allDay,
        color_override:   initialData.color_override   ?? '',
        enable_dnd:       initialData.enable_dnd       ?? false,
        reminder_minutes: initialData.reminder_minutes ?? '',
      })
    } else {
      setForm({ title: '', description: '', category_id: '', start_at: '', end_at: '', all_day: false, color_override: '', enable_dnd: false, reminder_minutes: '' })
    }
    setError(null)
    setConfirmDelete(false)
  }, [isOpen, initialData])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleAllDayChange = (checked) => {
    setForm(f => ({
      ...f,
      all_day: checked,
      start_at: f.start_at ? (checked ? f.start_at.slice(0, 10) : f.start_at + 'T00:00') : '',
      end_at:   f.end_at   ? (checked ? f.end_at.slice(0, 10)   : f.end_at   + 'T00:00') : '',
    }))
  }

  const buildPayload = () => ({
    title:            form.title,
    description:      form.description      || undefined,
    category_id:      form.category_id      || undefined,
    start_at:         inputToISO(form.start_at, form.all_day),
    end_at:           inputToISO(form.end_at,   form.all_day),
    all_day:          form.all_day,
    color_override:   form.color_override   || undefined,
    enable_dnd:       form.enable_dnd,
    reminder_minutes: form.reminder_minutes || undefined,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    // Las instancias de rutina son de solo lectura — el submit no debería ocurrir
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
  }

  const handleDelete = async () => {
    try { await remove.mutateAsync(initialData.id); onClose() }
    catch { setError(t('errors.deleteEvent')) }
  }

  // Cancela solo esta ocurrencia de la rutina (crea una RoutineException)
  const handleCancelOccurrence = async () => {
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
  }

  const isPending = create.isPending || update.isPending

  // ── Vista de solo lectura para instancias de rutina ──────────────────────
  if (isRoutine) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

          {/* Header — igual que el modal de evento */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">
              🔁 {t('routines.title')}
            </h2>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Título — readonly */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('event.fields.title')}</label>
              <input
                readOnly
                value={form.title}
                className={inputCls + ' bg-gray-50 cursor-default'}
              />
            </div>

            {/* Descripción — readonly */}
            {form.description && (
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('event.fields.description')}</label>
                <textarea
                  readOnly
                  value={form.description}
                  rows={2}
                  className={`${inputCls} resize-none bg-gray-50 cursor-default`}
                />
              </div>
            )}

            {/* Fechas — readonly */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('event.fields.startAt')}</label>
                <input
                  readOnly
                  type="datetime-local"
                  value={form.start_at}
                  className={inputCls + ' h-[42px] bg-gray-50 cursor-default'}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>{t('event.fields.endAt')}</label>
                <input
                  readOnly
                  type="datetime-local"
                  value={form.end_at}
                  className={inputCls + ' h-[42px] bg-gray-50 cursor-default'}
                />
              </div>
            </div>

            {/* Nota readonly */}
            <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              {t('routines.readonlyNote')}
            </p>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Acciones — misma estructura que el modal de evento */}
            <div className="flex items-center justify-between pt-1">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors px-3 py-1.5 rounded-lg"
                >
                  {t('routines.cancelOccurrence')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500">{t('event.confirmDelete')}</span>
                  <button
                    type="button"
                    onClick={handleCancelOccurrence}
                    disabled={addException.isPending}
                    className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg"
                  >
                    {t('routines.cancelOccurrence')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >✕</button>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 max-w-[140px] py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-all"
              >
                {t('common:actions.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Vista normal para eventos ─────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? t('event.edit') : t('event.new')}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.title')}</label>
            <input
              required autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('event.fields.titlePlaceholder')}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={t('event.fields.descriptionPlaceholder')}
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.category')}</label>
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value ? Number(e.target.value) : '')}
              className={selectCls}
            >
              <option value="">{t('event.fields.categoryNone')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('event.fields.startAt')}</label>
              <input
                required
                type={form.all_day ? 'date' : 'datetime-local'}
                value={form.start_at}
                onChange={(e) => set('start_at', e.target.value)}
                className={inputCls + ' h-[42px]'}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('event.fields.endAt')}</label>
              <input
                required
                type={form.all_day ? 'date' : 'datetime-local'}
                value={form.end_at}
                onChange={(e) => set('end_at', e.target.value)}
                className={inputCls + ' h-[42px]'}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.reminder')}</label>
            <select
              value={form.reminder_minutes}
              onChange={(e) => set('reminder_minutes', e.target.value ? Number(e.target.value) : '')}
              className={selectCls}
            >
              <option value="">{t('event.fields.reminderNone')}</option>
              {REMINDER_OPTIONS.map((m) => (
                <option key={m} value={m}>{t(`event.fields.reminderOptions.${m}`)}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.all_day}
                onChange={(e) => handleAllDayChange(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 accent-slate-900 cursor-pointer"
              />
              <span className="text-sm text-slate-600">{t('event.fields.allDay')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.enable_dnd}
                onChange={(e) => set('enable_dnd', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 accent-slate-900 cursor-pointer"
              />
              <span className="text-sm text-slate-600">{t('event.fields.enableDnd')}</span>
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            {isEditing && !confirmDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors px-3 py-1.5 rounded-lg">
                {t('event.delete')}
              </button>
            )}
            {confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{t('event.confirmDelete')}</span>
                <button type="button" onClick={handleDelete}
                  className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors px-3 py-1.5 rounded-lg">
                  {t('event.delete')}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>
            )}
            {!confirmDelete && !isEditing && <span />}
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 max-w-[140px] py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? t('status.saving') : isEditing ? t('event.save') : t('event.create')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}