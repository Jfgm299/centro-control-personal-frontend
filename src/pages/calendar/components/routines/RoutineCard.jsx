import { useTranslation } from 'react-i18next'

function parseDays(rrule) {
  const m = rrule?.match(/BYDAY=([\w,]+)/)
  return m ? m[1].split(',') : []
}

const ALL_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

export default function RoutineCard({ routine, onEdit }) {
  const { t }  = useTranslation('calendar')
  const cat    = routine.category
  const color  = routine.color_override ?? cat?.color ?? '#1f2937'
  const icon   = cat?.icon ?? '🔁'
  const days   = parseDays(routine.rrule)

  return (
    <div
      onClick={() => onEdit?.(routine)}
      className="group flex items-start gap-3 px-4 py-3 rounded-2xl cursor-pointer
        bg-white/60 hover:bg-white/80 border border-white/50 hover:border-white/80
        shadow-sm hover:shadow-md transition-all duration-150"
    >
      <div className="w-1 rounded-full self-stretch shrink-0" style={{ backgroundColor: color }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-semibold text-slate-700 truncate">{routine.title}</span>
          {!routine.is_active && (
            <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1">
              {t('routines.inactive')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{routine.start_time?.slice(0, 5)} – {routine.end_time?.slice(0, 5)}</span>
          {days.length > 0 && (
            <div className="flex gap-0.5">
              {ALL_DAYS.map((d) => (
                <span
                  key={d}
                  className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold
                    ${days.includes(d) ? 'text-white' : 'text-gray-300 bg-gray-100'}`}
                  style={days.includes(d) ? { backgroundColor: color } : {}}
                >
                  {t(`routines.fields.days.${d}`)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <span className="text-gray-300 group-hover:text-gray-400 transition-colors text-xs self-center">›</span>
    </div>
  )
}