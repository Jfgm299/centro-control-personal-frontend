import { useTranslation } from 'react-i18next'

const glassInput = 'w-full px-3 py-2 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all'
const glassSelect = glassInput + ' appearance-none'
const glassLabel = 'text-white/60 text-sm mb-1 block'

// Helper: drag-drop variable insertion for text inputs
function makeDragHandlers(onChange, getValue) {
  return {
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      const v = e.dataTransfer.getData('variable')
      if (!v) return
      const el = e.currentTarget
      const start = el.selectionStart ?? el.value.length
      const end   = el.selectionEnd   ?? el.value.length
      const newVal = el.value.slice(0, start) + '{{' + v + '}}' + el.value.slice(end)
      onChange(newVal)
    },
  }
}

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// ── ScheduleOnceConfig ────────────────────────────────────────────────────────

export function ScheduleOnceConfig({ config = {}, onChange }) {
  const { t } = useTranslation('automations')

  return (
    <div>
      <label className={glassLabel}>{t('schedule.runAt')}</label>
      <input
        type="datetime-local"
        value={config.run_at ? toDatetimeLocal(config.run_at) : ''}
        onChange={e => onChange({ ...config, run_at: new Date(e.target.value).toISOString() })}
        className={glassInput}
      />
    </div>
  )
}

// ── ScheduleIntervalConfig ────────────────────────────────────────────────────

export function ScheduleIntervalConfig({ config = {}, onChange }) {
  const { t } = useTranslation('automations')

  const set = (key, value) => onChange({ ...config, [key]: value })

  const activeWeekdays = config.active_weekdays ?? []

  const toggleDay = (day) => {
    const next = activeWeekdays.includes(day)
      ? activeWeekdays.filter(d => d !== day)
      : [...activeWeekdays, day]
    set('active_weekdays', next)
  }

  return (
    <div className="flex flex-col gap-3.5">

      {/* Intervalo */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <label className={glassLabel}>{t('schedule.every')}</label>
        <div className="flex gap-2">
          <input
            type="number" min={1}
            value={config.interval_value ?? ''}
            onChange={e => set('interval_value', Number(e.target.value))}
            className={glassInput + ' !w-20'}
            {...makeDragHandlers(v => set('interval_value', v), () => config.interval_value ?? '')}
          />
          <select
            value={config.interval_unit ?? 'minutes'}
            onChange={e => set('interval_unit', e.target.value)}
            className={glassSelect + ' flex-1'}
          >
            {['minutes', 'hours', 'days'].map(u => (
              <option key={u} value={u}>{t(`schedule.units.${u}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Horario activo */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <label className={glassLabel}>{t('schedule.activeFrom')}</label>
        <div className="flex gap-2 items-center">
          <input
            type="time"
            value={config.active_from ?? ''}
            onChange={e => set('active_from', e.target.value)}
            className={glassInput + ' flex-1'}
          />
          <span className="text-white/30 text-xs">—</span>
          <input
            type="time"
            value={config.active_until ?? ''}
            onChange={e => set('active_until', e.target.value)}
            className={glassInput + ' flex-1'}
          />
        </div>
      </div>

      {/* Días activos */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <label className={glassLabel}>{t('schedule.activeDays')}</label>
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAYS.map(day => {
            const active = activeWeekdays.includes(day)
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-transparent border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {t(`schedule.days.${day}`)}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function toDatetimeLocal(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
