/**
 * EventBlock — renderizado custom de cada evento en FullCalendar.
 */
import { useTranslation } from 'react-i18next'

export default function EventBlock({ event }) {
  const { t } = useTranslation('calendar')
  const { title, extendedProps } = event
  const { color, enableDnd, isRoutine, isCancelled } = extendedProps ?? {}

  const bg      = color ?? '#6366f1'
  const opacity = isCancelled ? 0.4 : 1

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md h-full w-full overflow-hidden"
      style={{ backgroundColor: bg + '22', borderLeft: `3px solid ${bg}`, opacity }}
    >
      {isRoutine && (
        <span className="text-[9px] shrink-0" title={t('eventBlock.routine')}>🔁</span>
      )}
      {enableDnd && (
        <span className="text-[9px] shrink-0" title={t('eventBlock.dnd')}>🔕</span>
      )}
      <span className="text-[11px] font-medium truncate leading-tight" style={{ color: bg }}>
        {title}
      </span>
    </div>
  )
}