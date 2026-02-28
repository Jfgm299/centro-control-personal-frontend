import { useTranslation } from 'react-i18next'

const ACCOUNT_COLORS = {
  Revolut: '#6366f1',
  Imagin:  '#f59e0b',
}

/**
 * FilterBar — month selector + active drill-down indicator.
 */
export default function FilterBar({ months, selectedMonth, drilldownWeek, onSelectMonth, onClearDrilldown }) {
  const { t } = useTranslation('expenses')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Month pills */}
      <div className="flex flex-wrap gap-2">
        {months.map((m) => (
          <button
            key={m.monthKey}
            onClick={() => onSelectMonth(m.monthKey)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium transition-all border
              ${selectedMonth === m.monthKey
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }
            `}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Drill-down breadcrumb */}
      {drilldownWeek && (
        <button
          onClick={onClearDrilldown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200 hover:bg-indigo-100 transition-all"
        >
          <span>← {t('filter.backToMonth')}</span>
          <span className="font-bold">{drilldownWeek}</span>
        </button>
      )}
    </div>
  )
}

export { ACCOUNT_COLORS }