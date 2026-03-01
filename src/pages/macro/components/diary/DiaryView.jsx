import { useTranslation } from 'react-i18next'
import { useDailySummary }  from '../../hooks/useDailySummary'
import { useMacroGoals }    from '../../hooks/useMacroGoals'
import MealSection           from './MealSection'
import { MEAL_TYPES }        from '../../constants'

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function DailyProgress({ totals, goals }) {
  if (!goals) return null
  const items = [
    { key: 'energy_kcal',     label: 'kcal', color: '#f59e0b', goal: goals.energy_kcal,     current: totals.energy_kcal,     unit: ''  },
    { key: 'proteins_g',      label: 'P',    color: '#3b82f6', goal: goals.proteins_g,      current: totals.proteins_g,      unit: 'g' },
    { key: 'carbohydrates_g', label: 'C',    color: '#10b981', goal: goals.carbohydrates_g, current: totals.carbohydrates_g, unit: 'g' },
    { key: 'fat_g',           label: 'G',    color: '#f43f5e', goal: goals.fat_g,           current: totals.fat_g,           unit: 'g' },
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(({ key, label, color, goal, current, unit }) => {
        const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
        const over = goal > 0 && current > goal
        return (
          <div key={key} className="bg-white/[0.04] rounded-xl p-3">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold" style={{ color }}>{label}</span>
              <span className={`text-xs ${over ? 'text-red-400' : 'text-white/40'}`}>
                {Math.round(current)}{unit}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: over ? '#ef4444' : color,
                }}
              />
            </div>
            <p className="text-white/25 text-xs mt-1 text-right">{Math.round(goal)}{unit}</p>
          </div>
        )
      })}
    </div>
  )
}

export default function DiaryView({ date, onDateChange }) {
  const { t } = useTranslation('macro')

  const { data: summary, isLoading } = useDailySummary(date)
  const { data: goals }              = useMacroGoals()

  const today      = new Date().toISOString().split('T')[0]
  const isToday    = date === today
  const isFuture   = date > today

  // Build a map: mealType → entries[]
  const mealMap = {}
  summary?.meals?.forEach((meal) => {
    mealMap[meal.meal_type] = meal.entries
  })

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onDateChange(addDays(date, -1))}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors flex items-center justify-center"
        >
          ‹
        </button>

        <div className="flex-1 text-center">
          <p className="text-white/90 text-sm font-semibold capitalize">{formatDate(date)}</p>
          {isToday && (
            <span className="text-[#f59e0b] text-xs">{t('diary.today')}</span>
          )}
        </div>

        <button
          onClick={() => onDateChange(addDays(date, 1))}
          disabled={isToday || isFuture}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          ›
        </button>

        {!isToday && (
          <button
            onClick={() => onDateChange(today)}
            className="text-xs text-[#f59e0b] hover:text-[#d97706] transition-colors"
          >
            {t('diary.today')}
          </button>
        )}
      </div>

      {/* Daily progress bars */}
      {summary?.totals && (
        <DailyProgress totals={summary.totals} goals={goals} />
      )}

      {/* Meal sections */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-white/30 text-sm">{t('common.loading')}</div>
        </div>
      ) : (
        <div className="space-y-2">
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