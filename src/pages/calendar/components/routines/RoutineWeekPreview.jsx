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
    <div className="grid grid-cols-7 gap-2 h-full">
      {grid.map(({ key, label, routines: dayRoutines }) => (
        <div key={key} className="flex flex-col gap-2 min-w-0 h-full">
          <div className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.2em] py-2 sticky top-0 bg-transparent">
            {label}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar pb-4">
            {dayRoutines.map((r) => {
              const color = r.color_override ?? r.category?.color ?? '#818cf8'
              return (
                <div
                  key={r.id}
                  className="rounded-xl px-2 py-2 text-[10px] leading-snug border backdrop-blur-sm shadow-sm transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: color + '20', 
                    borderLeft: `3px solid ${color}`, 
                    borderColor: color + '30',
                    color: '#fff'
                  }}
                >
                  <div className="font-black truncate drop-shadow-sm">{r.title}</div>
                  <div className="text-[9px] font-bold opacity-50 mt-1 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3" />
                    </svg>
                    {r.start_time?.slice(0, 5)}
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