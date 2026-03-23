import { useTranslation }   from 'react-i18next'
import { useRoutines }      from '../../hooks/useRoutines'
import { useCalendarStore } from '../../store/calendarStore'
import clsx from 'clsx'

const EyeOn = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOff = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function RoutineFilter() {
  const { t } = useTranslation('calendar')
  const { data: routines = [] }                        = useRoutines()
  const { hiddenRoutineIds, toggleRoutineVisibility }  = useCalendarStore()

  if (routines.length === 0) return null

  return (
    <div className="py-2">
      <div className="text-[10px] font-black text-white/40 tracking-[0.1em] uppercase px-4 pt-4 pb-2">
        {t('routines.filter.title', 'Rutinas')}
      </div>
      <div className="flex flex-col gap-0.5 px-1">
        {routines.map(routine => {
          const visible = !hiddenRoutineIds.has(routine.id)
          return (
            <div
              key={routine.id}
              className={clsx(
                "flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all group",
                visible ? "bg-white/5" : "bg-transparent opacity-60"
              )}
            >
              <span className="text-[10px] opacity-50 shrink-0">🔁</span>
              <span className={clsx(
                "flex-1 text-[11px] font-bold truncate",
                visible ? "text-white/80" : "text-white/30"
              )}>
                {routine.title}
              </span>
              <button
                onClick={() => toggleRoutineVisibility(routine.id)}
                title={visible ? t('categories.filter.hide', 'Ocultar') : t('categories.filter.show', 'Mostrar')}
                className={clsx(
                  "w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                  visible ? "text-white/40 hover:text-white hover:bg-white/10" : "text-white/20 hover:text-white/40"
                )}
              >
                {visible ? <EyeOn /> : <EyeOff />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}