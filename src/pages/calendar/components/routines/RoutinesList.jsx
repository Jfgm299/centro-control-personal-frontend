import { useState } from 'react'
import { useTranslation }      from 'react-i18next'
import { useRoutines }         from '../../hooks/useRoutines'
import { useCategories }       from '../../hooks/useCategories'
import RoutineCard             from './RoutineCard'
import RoutineModal            from './RoutineModal'
import RoutineWeekPreview      from './RoutineWeekPreview'

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
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t('routines.title')}</h2>
          <p className="text-xs text-gray-400">{t('routines.subtitle')}</p>
        </div>
        <button
          onClick={() => setModal({ open: true, data: null })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700
            text-white text-xs font-semibold transition-colors shadow-sm"
        >
          + {t('routines.new')}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((key) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
            {t(`routines.${key}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <span className="text-4xl">🔁</span>
          <p className="text-sm font-medium text-slate-600">{t('routines.empty')}</p>
          <p className="text-xs text-gray-400">{t('routines.emptyHint')}</p>
        </div>
      ) : tab === 'list' ? (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {routinesWithCat.map((r) => (
            <RoutineCard key={r.id} routine={r} onEdit={(data) => setModal({ open: true, data })} />
          ))}
        </div>
      ) : (
        <RoutineWeekPreview routines={routinesWithCat} />
      )}

      <RoutineModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        initialData={modal.data}
      />
    </div>
  )
}