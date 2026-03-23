import { useState } from 'react'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function WorkoutCalendarMobile({ workoutDays = new Set() }) {
  const [offset, setOffset] = useState(0)

  const today = new Date()
  const viewDate = new Date(today.getFullYear(), today.getMonth() - offset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthLabel = viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })
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
    <div className="bg-white/10 rounded-2xl border border-white/20 shadow-lg backdrop-blur-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-white capitalize">{monthLabel}</span>
        <div className="flex gap-2">
          <button onClick={() => setOffset(o => o + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-xl bg-black/20 text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm border border-white/5 shadow-inner">‹</button>
          <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
            className="w-7 h-7 flex items-center justify-center rounded-xl bg-black/20 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-black/20 transition-all text-sm border border-white/5 shadow-inner">›</button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-white/40 font-bold uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Cells — más pequeñas */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const key = toKey(day)
          const hasWorkout = workoutDays.has(key)
          const tod = isToday(day)
          return (
            <div key={key} className="flex flex-col items-center py-1 gap-1">
              <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full transition-all
                ${tod ? 'bg-white text-black font-black shadow-md' : 'text-white/80 hover:bg-white/10'}`}>
                {day}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${hasWorkout ? 'bg-blue-400' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}