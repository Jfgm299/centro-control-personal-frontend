import { useState } from 'react'
import { useTranslation }      from 'react-i18next'
import { useRoutines }         from '../../hooks/useRoutines'
import { useCategories }       from '../../hooks/useCategories'
import RoutineCard             from './RoutineCard'
import RoutineModal            from './RoutineModal'
import RoutineWeekPreview      from './RoutineWeekPreview'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const TABS = ['list', 'weekPreview']

export default function RoutinesList() {
  const { t } = useTranslation('calendar')
  const { data: routines   = [], isLoading } = useRoutines()
  const { data: categories = [] }            = useCategories()
  const [tab,   setTab]   = useState('list')
  const [modal, setModal] = useState({ open: false, data: null })

  const routinesWithCat = routines.map((r) => ({
    ...r,
    category: categories.find((c) => c.id === r.category_id) ?? null,
  }))

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white drop-shadow-md">{t('routines.title')}</h2>
          <p className="text-sm font-medium text-white/40 mt-1 italic">{t('routines.subtitle')}</p>
        </div>
        <button
          onClick={() => setModal({ open: true, data: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        >
          + {t('routines.new')}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/5 shadow-inner w-fit">
        {TABS.map((key) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx(
              "px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all relative",
              tab === key ? "text-white" : "text-white/40 hover:text-white/70"
            )}>
            {tab === key && (
              <motion.div
                layoutId="active-tab-routines"
                className="absolute inset-0 bg-white/10 rounded-lg shadow-sm border border-white/10"
              />
            )}
            <span className="relative z-10">{t(`routines.${key}`)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-white/30">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-white/5 rounded-3xl border border-white/5">
          <span className="text-5xl drop-shadow-xl opacity-30">🔁</span>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            {t('routines.empty')}<br />
            <span className="text-xs opacity-60 italic">{t('routines.emptyHint')}</span>
          </p>
        </div>
      ) : tab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto no-scrollbar pb-10">
          {routinesWithCat.map((r) => (
            <RoutineCard key={r.id} routine={r} onEdit={(data) => setModal({ open: true, data })} />
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-white/5 rounded-3xl border border-white/5 p-6 backdrop-blur-sm overflow-hidden">
          <RoutineWeekPreview routines={routinesWithCat} />
        </div>
      )}

      <RoutineModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        initialData={modal.data}
      />
    </div>
  )
}