import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function WorkoutCalendar({ workoutDays = new Set() }) {
  const { t } = useTranslation('gym')
  const [offset, setOffset] = useState(0) // months back from today

  const today = new Date()
  const viewDate = new Date(today.getFullYear(), today.getMonth() - offset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthLabel = viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })

  // First day of month (0=Sun…6=Sat) → convert to Mon-first
  const firstDow = (viewDate.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const toKey = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700 capitalize">{monthLabel}</span>
        <div className="flex gap-1">
          <button onClick={() => setOffset((o) => o + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all text-sm">‹</button>
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm">›</button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-slate-300 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const key = toKey(day)
          const hasWorkout = workoutDays.has(key)
          const today_ = isToday(day)
          return (
            <div key={key} className="flex flex-col items-center py-1 gap-0.5">
              <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full
                ${today_ ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>
                {day}
              </span>
              {/* Dot indicator */}
              <span className={`w-1 h-1 rounded-full transition-all
                ${hasWorkout ? 'bg-indigo-500' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}