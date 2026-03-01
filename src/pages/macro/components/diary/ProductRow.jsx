import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteDiaryEntry } from '../../hooks/useDiaryMutations'
import { NUTRISCORE_COLORS } from '../../constants'

function fmt(val, dec = 1) {
  if (val == null) return '—'
  return Number(val).toFixed(dec)
}

export default function ProductRow({ entry, date }) {
  const { t }   = useTranslation('macro')
  const del      = useDeleteDiaryEntry(date)
  const [confirm, setConfirm] = useState(false)

  const { product } = entry

  const nutriscore = product.nutriscore?.toLowerCase()
  const nsColor    = NUTRISCORE_COLORS[nutriscore] ?? '#9ca3af'

  const handleDelete = () => {
    if (!confirm) { setConfirm(true); return }
    del.mutate(entry.id)
  }

  return (
    <div
      className="group flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
      style={{ borderLeft: '2px solid rgba(0,0,0,0.06)' }}
    >
      {/* Product image or placeholder */}
      <div className="w-7 h-7 rounded flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <span className="text-xs text-gray-300">🍽</span>
        )}
      </div>

      {/* Name + brand */}
      <div className="flex-1 min-w-0">
        <span className="text-gray-800 text-sm font-medium truncate block leading-tight">
          {product.product_name}
        </span>
        {product.brand && (
          <span className="text-gray-400 text-xs truncate block leading-tight">
            {product.brand}
          </span>
        )}
      </div>

      {/* Nutriscore badge */}
      {nutriscore && (
        <span
          className="text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: nsColor, fontSize: '0.6rem' }}
        >
          {nutriscore}
        </span>
      )}

      {/* Amount */}
      <span className="text-gray-400 text-xs flex-shrink-0 w-12 text-right">
        {entry.amount_g}g
      </span>

      {/* Nutrient pills */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <NutrientPill label="kcal" value={fmt(entry.energy_kcal, 0)} color="#f59e0b" />
        <NutrientPill label="P"    value={fmt(entry.proteins_g)}     color="#3b82f6" />
        <NutrientPill label="C"    value={fmt(entry.carbohydrates_g)}color="#10b981" />
        <NutrientPill label="G"    value={fmt(entry.fat_g)}          color="#f43f5e" />
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={del.isPending}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-gray-300 hover:text-red-400 text-xs px-1"
        title={confirm ? t('common.confirm') : t('common.delete')}
      >
        {confirm ? '✓' : '×'}
      </button>
    </div>
  )
}

function NutrientPill({ label, value, color }) {
  return (
    <span className="flex items-center gap-0.5 text-xs">
      <span className="font-semibold" style={{ color }}>{value}</span>
      <span className="text-gray-400">{label}</span>
    </span>
  )
}