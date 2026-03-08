import { useTranslation } from 'react-i18next'

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '7px 10px', fontSize: 13,
  border: '1px solid #e5e7eb', borderRadius: 8,
  outline: 'none', color: '#111827',
  fontFamily: 'inherit', background: '#fff',
}

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: '#6b7280',
  marginBottom: 4, display: 'block',
}

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// ── ScheduleOnceConfig ────────────────────────────────────────────────────────

export function ScheduleOnceConfig({ config = {}, onChange }) {
  const { t } = useTranslation('automations')

  return (
    <div>
      <label style={labelStyle}>{t('schedule.runAt')}</label>
      <input
        type="datetime-local"
        value={config.run_at ? toDatetimeLocal(config.run_at) : ''}
        onChange={e => onChange({ ...config, run_at: new Date(e.target.value).toISOString() })}
        style={inputStyle}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Intervalo */}
      <div>
        <label style={labelStyle}>{t('schedule.every')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number" min={1}
            value={config.interval_value ?? ''}
            onChange={e => set('interval_value', Number(e.target.value))}
            style={{ ...inputStyle, width: 80 }}
          />
          <select
            value={config.interval_unit ?? 'minutes'}
            onChange={e => set('interval_unit', e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          >
            {['minutes', 'hours', 'days'].map(u => (
              <option key={u} value={u}>{t(`schedule.units.${u}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Horario activo */}
      <div>
        <label style={labelStyle}>{t('schedule.activeFrom')}</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="time"
            value={config.active_from ?? ''}
            onChange={e => set('active_from', e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>
          <input
            type="time"
            value={config.active_until ?? ''}
            onChange={e => set('active_until', e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      {/* Días activos */}
      <div>
        <label style={labelStyle}>{t('schedule.activeDays')}</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {WEEKDAYS.map(day => {
            const active = activeWeekdays.includes(day)
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                style={{
                  padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  border: '1px solid',
                  borderColor: active ? '#0f172a' : '#e5e7eb',
                  background:  active ? '#0f172a' : '#fff',
                  color:       active ? '#fff'    : '#6b7280',
                  cursor: 'pointer',
                }}
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