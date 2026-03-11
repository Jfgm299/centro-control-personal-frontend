import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation }      from 'react-i18next'
import { useCategories }       from '../../hooks/useCategories'
import { useRoutineMutations } from '../../hooks/useRoutineMutations'
import clsx from 'clsx'
import CategorySelect from '../categories/CategorySelect'
import SelectInput from '../../../../components/ui/SelectInput'

const inputCls = 'w-full px-4 py-2.5 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner'
const selectCls = 'w-full px-4 py-2.5 h-[42px] text-sm bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner appearance-none'
const labelCls = 'text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block'

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

  const reminderOptions = useMemo(() => [
    { value: '', label: t('event.fields.reminderNone') },
    ...REMINDER_OPTIONS.map(m => ({
      value: m,
      label: t(`event.fields.reminderOptions.${m}`),
    }))
  ], [t])

  const modalBody = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? t('routines.edit') : t('routines.new')}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5 overflow-y-auto flex-1">

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
            <CategorySelect
              categories={categories}
              value={form.category_id}
              onChange={(val) => set('category_id', val)}
            />
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.startTime')}</label>
              <input required type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} 
                className={clsx(inputCls, 'h-[42px]')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.endTime')}</label>
              <input required type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} 
                className={clsx(inputCls, 'h-[42px]')}
              />
            </div>
          </div>

          {/* Fechas validez */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.validFrom')}</label>
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => set('valid_from', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.validUntil')}</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => set('valid_until', e.target.value)}
                placeholder="Fecha de fin de validez (opcional)"
                className={inputCls}
              />
            </div>
          </div>

          {/* Frecuencia */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('routines.fields.frequency')}</label>
            <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
              {FREQS.map((f) => (
                <button key={f} type="button" onClick={() => setFreq(f)}
                  className={clsx(
                    "flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all border",
                    freq === f ? "bg-white/20 text-white border-white/30 shadow-sm" : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
                  )}>
                  {t(`routines.fields.frequencies.${f}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Días (solo para WEEKLY) */}
          {freq === 'WEEKLY' && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('routines.fields.daysLabel')}</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {DAYS.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={clsx(
                      "flex-1 min-w-[40px] py-2 rounded-lg text-[11px] font-black border transition-all shadow-sm",
                      days.includes(day) 
                        ? "bg-white text-slate-900 border-white" 
                        : "bg-black/20 border-white/5 text-white/40 hover:text-white"
                    )}>
                    {t(`routines.fields.days.${day}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recordatorio */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('event.fields.reminder')}</label>
            <SelectInput
              options={reminderOptions}
              value={form.reminder_minutes}
              onChange={(val) => set('reminder_minutes', val)}
              placeholder={t('event.fields.reminderNone')}
              labelKey="label"
            />
          </div>

          {/* DND */}
          <div className="py-2">
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
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{t('routines.fields.enableDnd')}</span>
            </label>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-200 bg-red-500/20 border border-red-500/30 px-4 py-3 rounded-xl shadow-lg">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
            {isEditing && !confirmDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                {t('routines.delete')}
              </button>
            )}
            {confirmDelete && (
              <div className="flex items-center gap-3 bg-red-500/10 p-2 rounded-2xl border border-red-500/20 shadow-inner">
                <span className="text-[10px] font-black uppercase text-red-300 ml-2">{t('routines.confirmDelete')}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={handleDelete}
                    disabled={isPending}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-md">
                    {t('common:actions.confirm', { defaultValue: 'Si' })}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs font-bold text-white/50 hover:text-white transition-all">✕</button>
                </div>
              </div>
            )}
            {!confirmDelete && !isEditing && <span />}
            <button type="submit" disabled={isPending}
              className="flex-1 max-w-[160px] py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all border border-white/20 shadow-lg drop-shadow-sm ml-auto">
              {isPending ? t('status.saving') : isEditing ? t('routines.save') : t('routines.create')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )

  return createPortal(modalBody, document.getElementById('modal-root'))
}