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
    <div className="bg-white/10 rounded-3xl border border-white/20 shadow-lg backdrop-blur-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-base font-bold text-white capitalize">{monthLabel}</span>
        <div className="flex gap-2">
          <button onClick={() => setOffset((o) => o + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/20 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm border border-white/5 shadow-inner">‹</button>
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/20 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-black/20 transition-all text-sm border border-white/5 shadow-inner">›</button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-white/40 font-bold uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const key = toKey(day)
          const hasWorkout = workoutDays.has(key)
          const today_ = isToday(day)
          return (
            <div key={key} className="flex flex-col items-center py-1 gap-1">
              <span className={`text-sm w-8 h-8 flex items-center justify-center rounded-full transition-all
                ${today_ ? 'bg-white text-black font-black shadow-md' : 'text-white/80 hover:bg-white/10'}`}>
                {day}
              </span>
              {/* Dot indicator */}
              <span className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm
                ${hasWorkout ? 'bg-blue-400' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}