import { useState, useEffect } from 'react'
import { useTranslation }       from 'react-i18next'
import { useMacroGoals, useUpsertGoals } from '../hooks/useMacroGoals'
import { NUTRIENT_COLORS }      from '../constants'

const FIELDS = [
  { key: 'energy_kcal',     label: 'kcal',   unit: 'kcal', color: NUTRIENT_COLORS.energy_kcal,     min: 500,  max: 5000, step: 50  },
  { key: 'proteins_g',      label: 'Prot',   unit: 'g',    color: NUTRIENT_COLORS.proteins_g,      min: 10,   max: 300,   step: 5   },
  { key: 'carbohydrates_g', label: 'Carbs',  unit: 'g',    color: NUTRIENT_COLORS.carbohydrates_g, min: 10,   max: 300,  step: 5   },
  { key: 'fat_g',           label: 'Grasas', unit: 'g',    color: NUTRIENT_COLORS.fat_g,           min: 5,    max: 200,   step: 5   },
  { key: 'fiber_g',         label: 'Fibra',  unit: 'g',    color: NUTRIENT_COLORS.fiber_g,         min: 0,    max: 100,   step: 1   },
]

export default function GoalsModal({ onClose }) {
  const { t }           = useTranslation('macro')
  const { data: goals } = useMacroGoals()
  const upsert          = useUpsertGoals()

  const [form, setForm] = useState({
    energy_kcal:     2000,
    proteins_g:      150,
    carbohydrates_g: 250,
    fat_g:           65,
    fiber_g:         25,
  })

  useEffect(() => {
    if (goals) {
      setForm({
        energy_kcal:     goals.energy_kcal     ?? 2000,
        proteins_g:      goals.proteins_g      ?? 150,
        carbohydrates_g: goals.carbohydrates_g ?? 250,
        fat_g:           goals.fat_g           ?? 65,
        fiber_g:         goals.fiber_g         ?? 25,
      })
    }
  }, [goals])

  const handleSave = async () => {
    try {
      await upsert.mutateAsync(form)
      onClose()
    } catch { /* error handled by mutation */ }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-gray-800 font-semibold">{t('goals.title')}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {FIELDS.map(({ key, label, unit, color, min, max, step }) => (
            <div key={key}>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color }}>
                  {label}
                </label>
                <span className="text-gray-700 text-sm font-semibold">
                  {form[key]}<span className="text-gray-400 text-xs ml-1">{unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={form[key] ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200"
                style={{ accentColor: color }}
              />
              <div className="flex justify-between text-gray-300 text-xs mt-0.5">
                <span>{min}</span>
                <span>{max}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={upsert.isPending}
            className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] text-black text-sm font-semibold hover:bg-[#d97706] disabled:opacity-50 transition-colors"
          >
            {upsert.isPending ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}