import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export default function YearFilter({ years, selected, onChange }) {
  const { t } = useTranslation('flights')

  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 p-1.5 bg-black/20 rounded-full backdrop-blur-md border border-white/5 shadow-inner">
        <button
          onClick={() => onChange(null)}
          className={clsx(
            'px-5 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm',
            selected === null
              ? 'bg-white/20 text-white border border-white/10'
              : 'text-white/50 hover:text-white/80 border border-transparent'
          )}
        >
          {t('passport.allTime')}
        </button>
        {years.map(year => (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={clsx(
              'px-5 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm',
              selected === year
                ? 'bg-white/20 text-white border border-white/10'
                : 'text-white/50 hover:text-white/80 border border-transparent'
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  )
}