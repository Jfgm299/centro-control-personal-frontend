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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 capitalize">{monthLabel}</span>
        <div className="flex gap-1">
          <button onClick={() => setOffset(o => o + 1)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-sm">‹</button>
          <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 text-sm">›</button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-slate-300 font-medium py-0.5">{d}</div>
        ))}
      </div>

      {/* Cells — más pequeñas */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const key = toKey(day)
          const hasWorkout = workoutDays.has(key)
          const tod = isToday(day)
          return (
            <div key={key} className="flex flex-col items-center py-0.5 gap-0.5">
              <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full
                ${tod ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}>
                {day}
              </span>
              <span className={`w-1 h-1 rounded-full ${hasWorkout ? 'bg-indigo-500' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}