import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useMacroStats } from '../../hooks/useMacroStats'
import { useMacroGoals } from '../../hooks/useMacroGoals'
import NutrientGauge              from './NutrientGauge'
import NutrientEvolutionChart     from './NutrientEvolutionChart'
import GoalsModal                 from '../GoalsModal'
import { NUTRIENT_COLORS }        from '../../constants'

const PERIOD_OPTIONS = [7, 30, 90]

const GAUGE_CONFIG = [
  { key: 'avg_energy_kcal',     goalKey: 'energy_kcal',     unit: 'kcal', label: 'kcal'  },
  { key: 'avg_proteins_g',      goalKey: 'proteins_g',      unit: 'g',    label: 'Prot'  },
  { key: 'avg_carbohydrates_g', goalKey: 'carbohydrates_g', unit: 'g',    label: 'Carbs' },
  { key: 'avg_fat_g',           goalKey: 'fat_g',           unit: 'g',    label: 'Grasas'},
  { key: 'avg_fiber_g',         goalKey: 'fiber_g',         unit: 'g',    label: 'Fibra' },
]

const NUTRIENT_COLOR_MAP = {
  avg_energy_kcal:     NUTRIENT_COLORS.energy_kcal,
  avg_proteins_g:      NUTRIENT_COLORS.proteins_g,
  avg_carbohydrates_g: NUTRIENT_COLORS.carbohydrates_g,
  avg_fat_g:           NUTRIENT_COLORS.fat_g,
  avg_fiber_g:         NUTRIENT_COLORS.fiber_g,
}

function GlassCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
        relative rounded-2xl p-4 md:p-6 backdrop-blur-xl backdrop-saturate-150
        bg-white/5 border border-white/10 shadow-xl shadow-black/5 ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export default function StatsView() {
  const { t }                     = useTranslation('macro')
  const [days, setDays]           = useState(30)
  const [goalsOpen, setGoalsOpen] = useState(false)

  const { data: stats, isLoading } = useMacroStats(days)
  const { data: goals }            = useMacroGoals()

  const avg = stats?.daily_average ?? {}

  return (
    <div className="space-y-4">

      {/* Period selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm">
            {PERIOD_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="relative px-4 py-1.5 rounded-full text-xs font-semibold transition-colors text-white/60 hover:text-white"
              >
                {days === d && (
                  <motion.div
                    layoutId="stats-period-indicator"
                    className="absolute inset-0 bg-white/10 rounded-full shadow-md"
                  />
                )}
                <span className="relative z-10">{d}d</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm">
            <button
              onClick={() => setGoalsOpen(true)}
              className="relative px-3 py-1 rounded-full text-xs font-semibold transition-colors text-white/60 hover:text-white flex items-center gap-2"
            >
                            <span className="relative z-10">{t('stats.editGoals')}</span>
            </button>
          </div>
        </div>

      {/* Consistency KPI */}
      {stats && (
        <GlassCard>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('stats.daysLogged'),   value: stats.days_logged,                       suffix: ''  },
              { label: t('stats.consistency'),  value: `${Math.round(stats.consistency_pct)}`,  suffix: '%' },
              { label: t('stats.totalEntries'), value: stats.total_entries,                     suffix: ''  },
            ].map(({ label, value, suffix }) => (
              <div key={label} className="text-center">
                <p className="text-white text-2xl font-bold">{value}<span className="text-white/50 text-base">{suffix}</span></p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Gauges */}
      <GlassCard>
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
          {t('stats.dailyAvg')} · {days}d
        </h3>
        {isLoading ? (
          <div className="flex justify-center py-8 text-white/60 text-sm">{t('common.loading')}</div>
        ) : (
          <div className="flex justify-around flex-wrap gap-4">
            {GAUGE_CONFIG.map(({ key, goalKey, unit, label }) => (
              <NutrientGauge
                key={key}
                label={label}
                current={avg[key] ?? 0}
                goal={goals?.[goalKey] ?? 0}
                color={NUTRIENT_COLOR_MAP[key]}
                unit={unit}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Evolution line chart */}
      <GlassCard>
        <NutrientEvolutionChart />
      </GlassCard>

      {/* Top products */}
      {stats?.top_products?.length > 0 && (
        <GlassCard>
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('stats.topProducts')}
          </h3>
          <div className="space-y-2">
            {stats.top_products.slice(0, 5).map(({ product, entry_count }, i) => (
              <div
                key={product.id}
                                className="
                  flex items-center gap-3 px-3 py-2 rounded-xl
                  bg-black/10 hover:bg-black/20 transition-colors
                "
              >
                <span className="text-white/40 text-sm w-5 text-center flex-shrink-0">{i + 1}</span>
                <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                    : <span className="text-lg">🍽️</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{product.product_name}</p>
                  {product.brand && <p className="text-white/50 text-xs truncate">{product.brand}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 text-sm font-semibold">{entry_count}×</p>
                  {product.energy_kcal_100g != null && (
                    <p className="text-white/40 text-xs">{Math.round(product.energy_kcal_100g)} kcal</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <AnimatePresence>
        {goalsOpen && <GoalsModal onClose={() => setGoalsOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
