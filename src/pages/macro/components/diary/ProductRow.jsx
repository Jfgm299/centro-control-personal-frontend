import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useDeleteDiaryEntry } from '../../hooks/useDiaryMutations'
import { NUTRISCORE_COLORS } from '../../constants'

function fmt(val, dec = 1) {
  if (val == null) return '—'
  return Number(val).toFixed(dec)
}

function NutrientInfo({ label, value, color }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold" style={{ color }}>{value}</p>
      <p className="text-[0.6rem] text-white/50 uppercase">{label}</p>
    </div>
  )
}

export default function ProductRow({ entry, date }) {
  const { t } = useTranslation('macro')
  const del = useDeleteDiaryEntry(date)
  const [isDeleting, setIsDeleting] = useState(false)

  const { product } = entry

  const handleDelete = () => {
    if (!isDeleting) {
      setIsDeleting(true)
      setTimeout(() => setIsDeleting(false), 2000) // Reset after 2s
      return
    }
    del.mutate(entry.id)
  }


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            className="
        group flex items-center gap-3 px-3 py-2 rounded-lg
        bg-white/5 hover:bg-white/10 transition-colors
      "
    >
      {/* Image */}
      <div className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden bg-white/5 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <span className="text-xl">🍽️</span>
        )}
      </div>

      {/* Name + Brand + Amount */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">
          {product.product_name}
        </p>
        <p className="text-white/60 text-xs truncate">
          {product.brand} · {entry.amount_g}g
        </p>
      </div>

      {/* Nutrients (desktop) */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <NutrientInfo label="kcal" value={fmt(entry.energy_kcal, 0)} color="#f59e0b" />
        <NutrientInfo label="Prot" value={fmt(entry.proteins_g)} color="#3b82f6" />
        <NutrientInfo label="Carb" value={fmt(entry.carbohydrates_g)} color="#10b981" />
        <NutrientInfo label="Gras" value={fmt(entry.fat_g)} color="#f43f5e" />
      </div>

      {/* Kcal (mobile) */}
      <div className="md:hidden flex-shrink-0">
        <NutrientInfo label="kcal" value={fmt(entry.energy_kcal, 0)} color="#f59e0b" />
      </div>


      {/* Delete Button */}
      <div className="relative w-8 h-8 flex-shrink-0">
        <AnimatePresence>
          <motion.button
            key={isDeleting ? 'confirm' : 'delete'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={handleDelete}
            disabled={del.isPending}
                        className={`
              w-full h-full rounded-full flex items-center justify-center transition-colors
              ${isDeleting
                ? 'bg-red-500/80 text-white'
                : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white'
              }
            `}
            title={isDeleting ? t('common.confirm') : t('common.delete')}
          >
            {isDeleting ? '✓' : '×'}
          </motion.button>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
