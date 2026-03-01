import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductRow      from './ProductRow'
import AddProductFlow  from './AddProductFlow'

export default function MealSection({ mealKey, icon, entries = [], date }) {
  const { t } = useTranslation('macro')
  const [open, setOpen]     = useState(true)
  const [adding, setAdding] = useState(false)

  const totalKcal     = entries.reduce((s, e) => s + (e.energy_kcal  ?? 0), 0)
  const totalProteins = entries.reduce((s, e) => s + (e.proteins_g   ?? 0), 0)
  const hasEntries    = entries.length > 0

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      {/* Section header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1 text-gray-700 text-sm font-semibold">
          {t(`meals.${mealKey}`)}
        </span>

        {hasEntries && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#f59e0b] font-semibold">
              {Math.round(totalKcal)} kcal
            </span>
            <span className="text-gray-400">
              {totalProteins.toFixed(1)}g P
            </span>
          </div>
        )}

        {hasEntries && (
          <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        )}

        <span className="text-gray-400 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {/* Entries + Add */}
      {open && (
        <div className="bg-white px-2 pb-2">
          {entries.length > 0 && (
            <div className="pt-1 space-y-0.5">
              {entries.map((entry) => (
                <ProductRow key={entry.id} entry={entry} date={date} />
              ))}
            </div>
          )}

          {adding ? (
            <AddProductFlow
              mealType={mealKey}
              date={date}
              onClose={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              <span className="text-lg leading-none">+</span>
              <span>{t('add.addProduct')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}