import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReminderCard from './ReminderCard'

export default function ReminderCategory({ category, reminders, onAdd, onDragStart }) {
  const { t }          = useTranslation('calendar')
  const [open, setOpen] = useState(true)

  const color = category?.color ?? '#94a3b8'
  const icon  = category?.icon  ?? '📌'
  const name  = category?.name  ?? t('reminders.uncategorized')

  return (
    <div className="flex flex-col gap-1">
      {/* Header de categoría */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left group"
        >
          <span
            className="text-[9px] text-gray-400 transition-transform duration-200 shrink-0"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >▶</span>
          <span className="text-xs">{icon}</span>
          <span
            className="text-xs font-semibold truncate"
            style={{ color }}
          >{name}</span>
          <span className="text-[10px] text-gray-400 shrink-0">({reminders.length})</span>
        </button>

        {/* Botón + */}
        <button
          onClick={() => onAdd?.(category)}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold shrink-0"
          title={t('reminders.addToCategory')}
        >+</button>
      </div>

      {/* Recordatorios */}
      {open && (
        <div className="flex flex-col gap-1 pl-2">
          {reminders.length === 0 ? (
            <p className="text-[10px] text-gray-400 px-3 py-1 italic">
              {t('reminders.emptyCategory')}
            </p>
          ) : (
            reminders.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                color={color}
                onDragStart={onDragStart}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}