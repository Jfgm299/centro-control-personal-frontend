import { useRef } from 'react'

const PRIORITY_DOT = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-emerald-400' }

export default function ReminderCard({ reminder, color, onDragStart }) {
  const ref = useRef(null)

  const handleDragStart = (e) => {
    // Guarda los datos del reminder para usarlos al soltar en el calendario
    e.dataTransfer.setData('reminderId', String(reminder.id))
    e.dataTransfer.setData('reminderTitle', reminder.title)
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart?.(reminder)
  }

  return (
    <div
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      className="group flex items-start gap-2 px-3 py-2 rounded-xl cursor-grab active:cursor-grabbing
        bg-white/60 hover:bg-white/80 border border-white/50 hover:border-white/80
        shadow-sm hover:shadow-md transition-all duration-150 select-none"
    >
      {/* Color bar */}
      <div className="w-0.5 rounded-full self-stretch shrink-0 mt-0.5" style={{ backgroundColor: color }} />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate leading-snug">{reminder.title}</p>
        {reminder.due_date && (
          <p className="text-[10px] text-gray-400 mt-0.5">{reminder.due_date}</p>
        )}
      </div>

      {/* Priority dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${PRIORITY_DOT[reminder.priority] ?? 'bg-gray-300'}`} />
    </div>
  )
}