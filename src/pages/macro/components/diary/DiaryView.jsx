import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useDailySummary }  from '../../hooks/useDailySummary'

import { useMacroGoals }    from '../../hooks/useMacroGoals'
import MealSection           from './MealSection'
import { MEAL_TYPES }        from '../../constants'

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'short',
  })
}

function toLocalISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toLocalISO(d)
}

function DailyProgress({ totals, goals }) {
  if (!goals) return null

  const items = [
    { key: 'proteins_g',      label: 'Proteins', color: '#38bdf8', goal: goals.proteins_g,      current: totals.proteins_g },
    { key: 'carbohydrates_g', label: 'Carbs',    color: '#2dd4bf', goal: goals.carbohydrates_g, current: totals.carbohydrates_g },
    { key: 'fat_g',           label: 'Fats',     color: '#fb7185', goal: goals.fat_g,           current: totals.fat_g },
  ]

  const calPct = goals.energy_kcal > 0 ? (totals.energy_kcal / goals.energy_kcal) * 100 : 0
  const calColor = '#facc15'

  return (
    <div className="relative rounded-2xl p-4 md:p-6 backdrop-blur-xl backdrop-saturate-150 bg-white/5 border border-white/10 shadow-xl shadow-black/5">
      <div className="flex items-center justify-between">
        {/* Calories */}
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={calColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${calPct}, 100`}
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${calPct}, 100` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              className="text-xl md:text-3xl font-bold text-white"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {Math.round(totals.energy_kcal)}
            </motion.p>
            <p className="text-xs text-white/50">KCAL</p>
          </div>
        </div>

        {/* Macros */}
        <div className="flex-1 grid grid-cols-3 gap-2 ml-4">
          {items.map(({ key, label, color, goal, current }) => {
            const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
            return (
              <div key={key} className="text-center">
                <p className="font-bold text-xl" style={{ color }}>{Math.round(current)}<span className="text-sm text-white/50">g</span></p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden my-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function DiaryView({ date, onDateChange }) {
  const { t } = useTranslation('macro')

  const { data: summary, isLoading } = useDailySummary(date)
  const { data: goals }              = useMacroGoals()

  const today   = toLocalISO(new Date())
  const isToday  = date === today
  const isFuture = date > today

  const mealMap = {}
  summary?.meals?.forEach((meal) => {
    mealMap[meal.meal_type] = meal.entries
  })

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center gap-2 md:gap-3 p-1 rounded-full bg-black/10">
        <button
          onClick={() => onDateChange(addDays(date, -1))}
                    className="
            w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/80
            transition-all active:scale-90 flex items-center justify-center
          "
        >
          ‹
        </button>

        <div className="flex-1 text-center">
          <p className="text-white text-sm font-semibold capitalize">{formatDate(date)}</p>
        </div>

        <button
          onClick={() => onDateChange(addDays(date, 1))}
          disabled={isFuture}
                    className="
            w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/80
            disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90
            flex items-center justify-center
          "
        >
          ›
        </button>

        {!isToday && (
          <button
            onClick={() => onDateChange(today)}
                      className="
            hidden md:block text-xs font-medium text-white/80 hover:text-white
            bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors
          "
          >
            {t('diary.today')}
          </button>
        )}
      </div>

      {/* Daily progress bars */}
      <AnimatePresence>
        {summary?.totals && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <DailyProgress totals={summary.totals} goals={goals} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal sections */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-white/60 text-sm">{t('common.loading')}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {MEAL_TYPES.map((m) => (
            <MealSection
              key={m.key}
              mealKey={m.key}
              icon={m.icon}
              entries={mealMap[m.key] ?? []}
              date={date}
            />
          ))}
        </div>
      )}
    </div>
  )
}
