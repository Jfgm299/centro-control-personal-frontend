import { useState, useEffect } from 'react'
import { useTranslation }      from 'react-i18next'
import { useCategories }       from '../../hooks/useCategories'
import { useRoutineMutations } from '../../hooks/useRoutineMutations'

const DAYS    = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
const FREQS   = ['DAILY', 'WEEKLY', 'MONTHLY']
const REMINDER_OPTIONS = [5, 10, 15, 30, 60, 120, 1440]

const inputCls  = 'w-full px-3 py-2.5 h-[42px] text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-800 placeholder-gray-400'
const selectCls = 'w-full px-3 py-2.5 h-[42px] text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-700'
const labelCls  = 'text-xs font-medium text-gray-500 mb-1 block'

function buildRRule(freq, days) {
  if (freq === 'WEEKLY' && days.length > 0) return `FREQ=WEEKLY;BYDAY=${days.join(',')}`
  return `FREQ=${freq}`
}

function parseRRule(rrule) {
  if (!rrule) return { freq: 'WEEKLY', days: ['MO', 'TU', 'WE', 'TH', 'FR'] }
  const freqMatch = rrule.match(/FREQ=(\w+)/)
  const daysMatch = rrule.match(/BYDAY=([\w,]+)/)
  return {
    freq: freqMatch?.[1] ?? 'WEEKLY',
    days: daysMatch ? daysMatch[1].split(',') : [],
  }
}

export default function RoutineModal({ isOpen, onClose, initialData }) {
  const { t } = useTranslation('calendar')
  const { data: categories = [] } = useCategories()
  const { create, update, remove } = useRoutineMutations()

  const isEditing = !!initialData?.id

  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    start_time: '', end_time: '', valid_from: '', valid_until: '',
    enable_dnd: false, reminder_minutes: '',
  })
  const [freq,  setFreq]  = useState('WEEKLY')
  const [days,  setDays]  = useState(['MO', 'TU', 'WE', 'TH', 'FR'])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      const { freq: f, days: d } = parseRRule(initialData.rrule)
      setFreq(f); setDays(d)
      setForm({
        title:            initialData.title            ?? '',
        description:      initialData.description      ?? '',
        category_id:      initialData.category_id      ?? '',
        start_time:       initialData.start_time       ?? '',
        end_time:         initialData.end_time         ?? '',
        valid_from:       initialData.valid_from       ?? '',
        valid_until:      initialData.valid_until      ?? '',
        enable_dnd:       initialData.enable_dnd       ?? false,
        reminder_minutes: initialData.reminder_minutes ?? '',
      })
    } else {
      setForm({ title: '', description: '', category_id: '', start_time: '', end_time: '',
        valid_from: new Date().toISOString().slice(0, 10), valid_until: '',
        enable_dnd: false, reminder_minutes: '' })
      setFreq('WEEKLY'); setDays(['MO', 'TU', 'WE', 'TH', 'FR'])
    }
    setError(null); setConfirmDelete(false)
  }, [isOpen, initialData])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const toggleDay = (day) =>
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])

  const buildPayload = () => ({
    title:            form.title,
    description:      form.description      || undefined,
    category_id:      form.category_id      || undefined,
    start_time:       form.start_time,
    end_time:         form.end_time,
    valid_from:       form.valid_from,
    valid_until:      form.valid_until       || undefined,
    enable_dnd:       form.enable_dnd,
    reminder_minutes: form.reminder_minutes  || undefined,
    rrule:            buildRRule(freq, days),
  })

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null)
    try {
      if (isEditing) await update.mutateAsync({ id: initialData.id, ...buildPayload() })
      else           await create.mutateAsync(buildPayload())
      onClose()
    } catch { setError(t('errors.saveRoutine')) }
  }

  const handleDelete = async () => {
    try { await remove.mutateAsync(initialData.id); onClose() }
    catch { setError(t('errors.deleteRoutine')) }
  }

  const isPending = create.isPending || update.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? t('routines.edit') : t('routines.new')}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('routines.fields.title')}</label>
            <input required autoFocus value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder={t('routines.fields.titlePlaceholder')} className={inputCls} />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('routines.fields.description')}</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder={t('routines.fields.descriptionPlaceholder')} rows={2}
              className={`${inputCls} h-auto resize-none`} />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('routines.fields.category')}</label>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value ? Number(e.target.value) : '')}
              className={selectCls}>
              <option value="">{t('routines.fields.categoryNone')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
            </select>
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.startTime')}</label>
              <input required type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.endTime')}</label>
              <input required type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Fechas validez */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.validFrom')}</label>
              <input required type="date" value={form.valid_from} onChange={(e) => set('valid_from', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.validUntil')}</label>
              <input type="date" value={form.valid_until} onChange={(e) => set('valid_until', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Frecuencia */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('routines.fields.frequency')}</label>
            <div className="flex gap-1">
              {FREQS.map((f) => (
                <button key={f} type="button" onClick={() => setFreq(f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${freq === f
                      ? 'bg-gray-900/10 text-gray-900 border-gray-900/20'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  {t(`routines.fields.frequencies.${f}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Días (solo para WEEKLY) */}
          {freq === 'WEEKLY' && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.daysLabel')}</label>
              <div className="flex gap-1">
                {DAYS.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                      ${days.includes(day)
                        ? 'bg-gray-900/10 text-gray-900 border-gray-900/20'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                    {t(`routines.fields.days.${day}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recordatorio */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.reminder')}</label>
            <select value={form.reminder_minutes} onChange={(e) => set('reminder_minutes', e.target.value ? Number(e.target.value) : '')}
              className={selectCls}>
              <option value="">{t('event.fields.reminderNone')}</option>
              {REMINDER_OPTIONS.map((m) => <option key={m} value={m}>{t(`event.fields.reminderOptions.${m}`)}</option>)}
            </select>
          </div>

          {/* DND */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={form.enable_dnd} onChange={(e) => set('enable_dnd', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 accent-slate-900 cursor-pointer" />
            <span className="text-sm text-slate-600">{t('routines.fields.enableDnd')}</span>
          </label>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Acciones */}
          <div className="flex items-center justify-between pt-1">
            {isEditing && !confirmDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors">
                {t('routines.delete')}
              </button>
            )}
            {confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{t('routines.confirmDelete')}</span>
                <button type="button" onClick={handleDelete}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors">
                  {t('routines.delete')}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>
            )}
            {!confirmDelete && <span />}
            <button type="submit" disabled={isPending}
              className="flex-1 max-w-[140px] py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {isPending ? t('status.saving') : isEditing ? t('routines.save') : t('routines.create')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}