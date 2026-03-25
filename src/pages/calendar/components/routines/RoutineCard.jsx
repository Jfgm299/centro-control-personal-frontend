import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

function parseDays(rrule) {
  const m = rrule?.match(/BYDAY=([\w,]+)/)
  return m ? m[1].split(',') : []
}

const ALL_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

export default function RoutineCard({ routine, onEdit }) {
  const { t }  = useTranslation('calendar')
  const cat    = routine.category
  const color  = routine.color_override ?? cat?.color ?? '#818cf8'
  const icon   = cat?.icon ?? '🔁'
  const days   = parseDays(routine.rrule)

  return (
    <div
      onClick={() => onEdit?.(routine)}
      className="group flex items-start gap-4 px-5 py-4 rounded-3xl cursor-pointer bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-[0.98] shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full opacity-60" style={{ backgroundColor: color }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg drop-shadow-md">{icon}</span>
          <span className="text-sm font-black text-white/90 truncate group-hover:text-white transition-colors">{routine.title}</span>
          {!routine.is_active && (
            <span className="text-[9px] font-black text-white/30 bg-white/5 border border-white/5 rounded-md px-1.5 py-0.5 uppercase tracking-widest">
              {t('routines.inactive')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-black text-white/40 tabular-nums uppercase tracking-tighter">
            <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
            </svg>
            {routine.start_time?.slice(0, 5)} – {routine.end_time?.slice(0, 5)}
          </div>
          {days.length > 0 && (
            <div className="flex gap-1">
              {ALL_DAYS.map((d) => (
                <span
                  key={d}
                  className={clsx(
                    "w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black transition-all shadow-sm border uppercase",
                    days.includes(d) ? "text-white border-white/20" : "text-white/20 bg-black/20 border-white/5"
                  )}
                  style={days.includes(d) ? { backgroundColor: color } : {}}
                >
                  {t(`routines.fields.days.${d}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all self-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}