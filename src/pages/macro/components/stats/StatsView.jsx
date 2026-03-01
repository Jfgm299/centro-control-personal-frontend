import { useState }              from 'react'
import { useTranslation }         from 'react-i18next'
import { useMacroStats }          from '../../hooks/useMacroStats'
import { useMacroGoals }          from '../../hooks/useMacroGoals'
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

export default function StatsView() {
  const { t }                     = useTranslation('macro')
  const [days, setDays]           = useState(30)
  const [goalsOpen, setGoalsOpen] = useState(false)

  const { data: stats, isLoading } = useMacroStats(days)
  const { data: goals }            = useMacroGoals()

  const avg = stats?.daily_average ?? {}

  return (
    <div className="space-y-6">

      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <button
          onClick={() => setGoalsOpen(true)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
        >
          🎯 {t('stats.editGoals')}
        </button>
      </div>

      {/* Consistency KPI */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('stats.daysLogged'),   value: stats.days_logged,                       suffix: ''  },
            { label: t('stats.consistency'),  value: `${Math.round(stats.consistency_pct)}`,  suffix: '%' },
            { label: t('stats.totalEntries'), value: stats.total_entries,                     suffix: ''  },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <p className="text-gray-800 text-xl font-bold">{value}<span className="text-gray-400 text-sm">{suffix}</span></p>
              <p className="text-gray-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gauges */}
      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          {t('stats.dailyAvg')} · {days}d
        </h3>
        {isLoading ? (
          <div className="flex justify-center py-8 text-gray-400 text-sm">{t('common.loading')}</div>
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
      </div>

      {/* Evolution line chart */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <NutrientEvolutionChart />
      </div>

      {/* Top products */}
      {stats?.top_products?.length > 0 && (
        <div>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            {t('stats.topProducts')}
          </h3>
          <div className="space-y-1.5">
            {stats.top_products.slice(0, 8).map(({ product, entry_count }, i) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <span className="text-gray-300 text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-7 h-7 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-gray-300 text-xs">🍽</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 text-sm truncate">{product.product_name}</p>
                  {product.brand && <p className="text-gray-400 text-xs truncate">{product.brand}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#f59e0b] text-sm font-semibold">{entry_count}×</p>
                  {product.energy_kcal_100g != null && (
                    <p className="text-gray-300 text-xs">{Math.round(product.energy_kcal_100g)} kcal/100g</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goalsOpen && <GoalsModal onClose={() => setGoalsOpen(false)} />}
    </div>
  )
}