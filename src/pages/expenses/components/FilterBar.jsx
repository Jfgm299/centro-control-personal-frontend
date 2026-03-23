import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const ACCOUNT_COLORS = {
  Revolut: '#BE8384',
  Imagin:  '#875152',
}

export default function FilterBar({ months, selectedMonth, drilldownWeek, onSelectMonth, onClearDrilldown }) {
  const { t } = useTranslation('expenses')

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Month pills */}
            <div className="flex flex-wrap gap-2 p-1 rounded-full bg-slate-800/80 backdrop-blur-sm">
        {months.map((m) => (
          <button
            key={m.monthKey}
            onClick={() => onSelectMonth(m.monthKey)}
            className="relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors text-white/60 hover:text-white"
          >
            {selectedMonth === m.monthKey && (
              <motion.div
                layoutId="filter-bar-indicator"
                className="absolute inset-0 bg-white/10 rounded-full shadow-md"
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Drill-down breadcrumb */}
      {drilldownWeek && (
        <button
          onClick={onClearDrilldown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-200 text-sm font-medium border border-sky-500/30 hover:bg-sky-500/30 transition-all"
        >
          <span>← {t('filter.backToMonth')}</span>
          <span className="font-bold">{drilldownWeek}</span>
        </button>
      )}
    </div>
  )
}

export { ACCOUNT_COLORS }
