import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { useDiaryEntries }  from '../../hooks/useDiaryEntries'
import { NUTRIENT_COLORS, TRACKED_NUTRIENTS } from '../../constants'

function startDateForDays(days) {
  const d = new Date()
  d.setDate(d.getDate() - days + 1)
  return d.toISOString().split('T')[0]
}

function groupByDay(entries) {
  const map = {}
  entries.forEach((e) => {
    if (!map[e.entry_date]) {
      map[e.entry_date] = {
        date: e.entry_date,
        energy_kcal: 0, proteins_g: 0,
        carbohydrates_g: 0, fat_g: 0, fiber_g: 0,
      }
    }
    TRACKED_NUTRIENTS.forEach((n) => {
      map[e.entry_date][n] += e[n] ?? 0
    })
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const NUTRIENT_UNITS = {
  energy_kcal:     'kcal',
  proteins_g:      'g',
  carbohydrates_g: 'g',
  fat_g:           'g',
  fiber_g:         'g',
}

const PERIOD_OPTIONS = [7, 14, 30, 90]

export default function NutrientEvolutionChart() {
  const { t } = useTranslation('macro')

  const [days, setDays]              = useState(30)
  const [activeNutrients, setActive] = useState(
    new Set(['energy_kcal', 'proteins_g', 'carbohydrates_g', 'fat_g'])
  )

  const start = startDateForDays(days)
  const end   = new Date().toISOString().split('T')[0]

  const { data: entries = [], isLoading } = useDiaryEntries({ start, end })

  const chartData = useMemo(() => groupByDay(entries), [entries])

  const toggleNutrient = (key) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-black/40 border border-white/20 rounded-xl p-3 shadow-lg text-xs space-y-1 backdrop-blur-sm">
        <p className="text-white/60 mb-2">{formatDateShort(label)}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{t(`nutrients.${p.dataKey}`)}</span>
            <span className="text-white font-semibold">
              {Math.round(p.value)} {NUTRIENT_UNITS[p.dataKey]}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header + period picker */}
      <div className="flex items-center justify-between">
        <h3 className="text-white/80 text-sm font-semibold">{t('stats.evolution')}</h3>
        <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm">
          {PERIOD_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="relative px-3 py-1 rounded-full text-xs font-semibold transition-colors text-white/60 hover:text-white"
            >
              {days === d && (
                <motion.div
                  layoutId="evolution-period-indicator"
                  className="absolute inset-0 bg-white/10 rounded-full shadow-md"
                />
              )}
              <span className="relative z-10">{d}d</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nutrient toggles */}
      <div className="flex flex-wrap gap-2">
        {TRACKED_NUTRIENTS.map((key) => {
          const active = activeNutrients.has(key)
          return (
            <button
              key={key}
              onClick={() => toggleNutrient(key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
                active
                  ? 'border-transparent text-black'
                  : 'border-white/20 text-white/60 bg-transparent hover:border-white/40'
              }`}
              style={active ? { background: NUTRIENT_COLORS[key], color: 'black' } : {}}
            >
              {t(`nutrients.${key}`)}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-white/60 text-sm">
          {t('common.loading')}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/40 text-sm">
          {t('stats.noData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {TRACKED_NUTRIENTS.filter((k) => activeNutrients.has(k)).map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={NUTRIENT_COLORS[key]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: NUTRIENT_COLORS[key] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
