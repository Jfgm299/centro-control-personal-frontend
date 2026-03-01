import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductRow      from './ProductRow'
import AddProductFlow  from './AddProductFlow'

export default function MealSection({ mealKey, icon, entries = [], date }) {
  const { t } = useTranslation('macro')
  const [open, setOpen]   = useState(true)
  const [adding, setAdding] = useState(false)

  const totalKcal    = entries.reduce((s, e) => s + (e.energy_kcal    ?? 0), 0)
  const totalProteins = entries.reduce((s, e) => s + (e.proteins_g    ?? 0), 0)
  const hasEntries   = entries.length > 0

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.06]">
      {/* Section header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1 text-white/80 text-sm font-semibold">
          {t(`meals.${mealKey}`)}
        </span>

        {hasEntries && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#f59e0b] font-medium">
              {Math.round(totalKcal)} kcal
            </span>
            <span className="text-white/30">
              {totalProteins.toFixed(1)}g P
            </span>
          </div>
        )}

        {/* Entry count badge */}
        {hasEntries && (
          <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        )}

        <span className="text-white/30 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {/* Entries + Add */}
      {open && (
        <div className="bg-white/[0.015] px-2 pb-2">
          {/* Product rows */}
          {entries.length > 0 && (
            <div className="pt-1 space-y-0.5">
              {entries.map((entry) => (
                <ProductRow key={entry.id} entry={entry} date={date} />
              ))}
            </div>
          )}

          {/* Add product flow */}
          {adding ? (
            <AddProductFlow
              mealType={mealKey}
              date={date}
              onClose={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/25 text-white/30 hover:text-white/60 transition-colors text-sm"
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