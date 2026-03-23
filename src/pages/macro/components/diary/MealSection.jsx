import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'

import ProductRow from './ProductRow'
import AddProductFlow from './AddProductFlow'


function Stat({ value, unit, label, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-xl md:text-2xl font-bold text-white">
        {Math.round(value)}
        <span className="text-sm font-medium text-white/50 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  )
}

export default function MealSection({ mealKey, icon, entries = [], date }) {
  const { t }       = useTranslation('macro')
  const [isAdding, setIsAdding] = useState(false)

  const totalKcal = entries.reduce((s, e) => s + (e.energy_kcal ?? 0), 0)
  const totalProteins = entries.reduce((s, e) => s + (e.proteins_g ?? 0), 0)
  const totalCarbs = entries.reduce((s, e) => s + (e.carbohydrates_g ?? 0), 0)
  const totalFat = entries.reduce((s, e) => s + (e.fat_g ?? 0), 0)
  const hasEntries = entries.length > 0

  return (
    <motion.div
      layout
            className={`
        relative rounded-2xl backdrop-blur-xl backdrop-saturate-150
        bg-white/5 border border-white/10 shadow-xl shadow-black/5
      `}
    >
      {/* Card Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4">
          <motion.span
            className="text-3xl md:text-4xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {icon}
          </motion.span>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-white">
              {t(`meals.${mealKey}`)}
            </h3>
            {hasEntries && (
              <p className="text-sm text-white/60">
                {entries.length} {t('add.items')}
              </p>
            )}
          </div>
          <motion.button
            onClick={() => setIsAdding(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
                        className="
              hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10
              hover:bg-white/20 text-white font-semibold transition-colors
            "
          >
            <span className="text-lg leading-none">+</span>
            <span>{t('add.addProduct')}</span>
          </motion.button>
        </div>

        {hasEntries && (
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/10 pt-4">
            <Stat value={totalKcal} unit="kcal" label={t('diary.kcal')} />
            <Stat value={totalProteins} unit="g" label={t('diary.proteins')} />
            <Stat value={totalCarbs} unit="g" label={t('diary.carbs')} />
            <Stat value={totalFat} unit="g" label={t('diary.fats')} />
          </div>
        )}
      </div>

      {/* Entries List & Add Flow */}
      <AnimatePresence>
        {hasEntries && !isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-2 space-y-1">
              {entries.map((entry) => (
                <ProductRow key={entry.id} entry={entry} date={date} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2"
          >
            <AddProductFlow
              mealType={mealKey}
              date={date}
              onClose={() => setIsAdding(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isAdding && (
        <div className="p-2 md:hidden">
          <motion.button
            onClick={() => setIsAdding(true)}
            whileTap={{ scale: 0.98 }}
                        className="
              w-full flex items-center justify-center gap-2 py-3 rounded-lg
              bg-white/10 hover:bg-white/20 text-white/80 hover:text-white
              font-semibold transition-all
            "
          >
            <span className="text-xl leading-none">+</span>
            <span>{t('add.addProduct')}</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
