import { useTranslation } from 'react-i18next'

const ALL_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

function parseDays(rrule) {
  const m = rrule?.match(/BYDAY=([\w,]+)/)
  return m ? m[1].split(',') : []
}

function parseFreq(rrule) {
  const m = rrule?.match(/FREQ=(\w+)/)
  return m?.[1] ?? ''
}

export default function RoutineWeekPreview({ routines }) {
  const { t } = useTranslation('calendar')

  const grid = ALL_DAYS.map((key) => ({
    key,
    label: t(`routines.fields.days.${key}`),
    routines: routines.filter((r) => {
      if (!r.is_active) return false
      const freq = parseFreq(r.rrule)
      if (freq === 'DAILY')  return true
      if (freq === 'WEEKLY') return parseDays(r.rrule).includes(key)
      return false
    }),
  }))

  return (
    <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
      {grid.map(({ key, label, routines: dayRoutines }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <div className="text-center text-xs font-bold text-gray-400 py-1 sticky top-0 bg-transparent">
            {label}
          </div>
          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {dayRoutines.map((r) => {
              const color = r.color_override ?? r.category?.color ?? '#1f2937'
              return (
                <div
                  key={r.id}
                  className="rounded-xl px-2 py-1.5 text-[10px] leading-snug"
                  style={{ backgroundColor: color + '1a', borderLeft: `3px solid ${color}`, color }}
                >
                  <div className="font-semibold truncate">{r.title}</div>
                  <div className="text-[9px] opacity-70 mt-0.5">
                    {r.start_time?.slice(0, 5)}–{r.end_time?.slice(0, 5)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}