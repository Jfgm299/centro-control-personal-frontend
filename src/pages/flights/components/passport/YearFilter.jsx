import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export default function YearFilter({ years, selected, onChange }) {
  const { t } = useTranslation('flights')

  return (
    <div className="flex gap-2 px-4 pt-4 pb-2">
      <button
        onClick={() => onChange(null)}
        className={clsx(
          'px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
          selected === null
            ? 'bg-white/20 text-white'
            : 'text-white/50 hover:text-white/80'
        )}
      >
        {t('passport.allTime')}
      </button>
      {years.map(year => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={clsx(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
            selected === year
              ? 'bg-white/20 text-white'
              : 'text-white/50 hover:text-white/80'
          )}
        >
          {year}
        </button>
      ))}
    </div>
  )
}