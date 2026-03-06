import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { MUSCLE_GROUP_COLORS, EXERCISE_TYPES } from '../../constants'
import api from '../../services/api'

function useCatalog() {
  return useQuery({
    queryKey: ['exercise-catalog'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/exercise-catalog/')
      return data
    },
  })
}

const TYPE_LABELS = {
  [EXERCISE_TYPES.WEIGHT_REPS]: '🏋️',
  [EXERCISE_TYPES.BODYWEIGHT]:  '💪',
  [EXERCISE_TYPES.CARDIO]:      '🏃',
}

const ALL_MUSCLES = ['Chest','Back','Biceps','Triceps','Shoulders','Legs','Core','Abs','Cardio']

export default function AddExerciseModal({ onAdd, onClose, isLoading }) {
  const { t } = useTranslation('gym')
  const { data: catalog = [], isLoading: loadingCatalog } = useCatalog()

  const [search, setSearch]         = useState('')
  const [filterMuscle, setFilter]   = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  // ── Custom create form ────────────────────────────────────────────────────
  const [customName, setCustomName]     = useState('')
  const [customType, setCustomType]     = useState(EXERCISE_TYPES.WEIGHT_REPS)
  const [customMuscles, setCustomMuscles] = useState([])

  const toggleMuscle = (m) =>
    setCustomMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const filtered = useMemo(() => {
    let list = catalog
    if (filterMuscle === 'Cardio') {
      list = list.filter(e => e.exercise_type === EXERCISE_TYPES.CARDIO)
    } else if (filterMuscle) {
      list = list.filter(e => e.muscle_groups.includes(filterMuscle))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.name.toLowerCase().includes(q))
    }
    return list
  }, [catalog, filterMuscle, search])

  const handleSelect = (ex) => {
    onAdd({
      name:          ex.name,
      exercise_type: ex.exercise_type,
      muscle_groups: ex.muscle_groups,
      catalog_id:    ex.id,
      notes:         null,
    })
  }

  const handleCreateCustom = async (e) => {
    e.preventDefault()
    if (!customName.trim()) return
    // Primero crear en catálogo, luego añadir al workout
    const { data: newEntry } = await api.post('/api/v1/exercise-catalog/', {
      name:          customName.trim(),
      exercise_type: customType,
      muscle_groups: customMuscles,
    })
    onAdd({
      name:          newEntry.name,
      exercise_type: newEntry.exercise_type,
      muscle_groups: newEntry.muscle_groups,
      catalog_id:    newEntry.id,
      notes:         null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800">
            {showCreate ? t('exercise.createTitle', { defaultValue: 'Nuevo ejercicio' }) : t('exercise.addTitle')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showCreate ? (
          /* ── Create custom ─────────────────────────────────────────────── */
          <form onSubmit={handleCreateCustom} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">{t('exercise.name')}</label>
              <input
                autoFocus required
                value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder={t('exercise.namePlaceholder')}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">{t('exercise.type')}</label>
              <div className="flex gap-2">
                {Object.values(EXERCISE_TYPES).map(et => (
                  <button key={et} type="button" onClick={() => setCustomType(et)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
                      ${customType === et ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                    {TYPE_LABELS[et]} {et === EXERCISE_TYPES.WEIGHT_REPS ? t('exercise.typeWeights') : et === EXERCISE_TYPES.BODYWEIGHT ? t('exercise.typeBodyweight', { defaultValue: 'Bodyweight' }) : t('exercise.typeCardio')}
                  </button>
                ))}
              </div>
            </div>

            {customType !== EXERCISE_TYPES.CARDIO && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">{t('exercise.muscleGroups', { defaultValue: 'Músculos trabajados' })}</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.filter(m => m !== 'Cardio').map(m => (
                    <button key={m} type="button" onClick={() => toggleMuscle(m)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                        ${customMuscles.includes(m) ? 'text-white border-transparent' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                      style={customMuscles.includes(m) ? { background: MUSCLE_GROUP_COLORS[m] ?? '#6366f1' } : {}}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={!customName.trim() || isLoading}
                className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40">
                {t('common.add')}
              </button>
            </div>
          </form>
        ) : (
          /* ── Catalog browser ───────────────────────────────────────────── */
          <>
            <div className="px-4 pt-3 pb-2 flex flex-col gap-2 flex-shrink-0">
              {/* Search */}
              <input
                autoFocus
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('exercise.searchPlaceholder', { defaultValue: 'Buscar ejercicio…' })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {/* Muscle filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button onClick={() => setFilter(null)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${!filterMuscle ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500'}`}>
                  {t('exercise.filterAll', { defaultValue: 'Todos' })}
                </button>
                {ALL_MUSCLES.map(m => (
                  <button key={m} onClick={() => setFilter(m === filterMuscle ? null : m)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                      ${filterMuscle === m ? 'text-white border-transparent' : 'border-slate-200 text-slate-500'}`}
                    style={filterMuscle === m ? { background: MUSCLE_GROUP_COLORS[m] ?? '#6366f1' } : {}}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {loadingCatalog ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">{t('exercise.noResults', { defaultValue: 'Sin resultados' })}</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {filtered.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelect(ex)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                    >
                      <span className="text-base">{TYPE_LABELS[ex.exercise_type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{ex.name}</p>
                        {ex.muscle_groups.length > 0 && (
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {ex.muscle_groups.map(m => (
                              <span key={m} className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                                style={{ background: MUSCLE_GROUP_COLORS[m] ?? '#94a3b8' }}>
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {ex.is_custom && (
                        <span className="text-xs text-slate-400 flex-shrink-0">custom</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create custom button */}
            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setShowCreate(true)}
                className="w-full py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                + {t('exercise.createCustom', { defaultValue: 'Crear ejercicio personalizado' })}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}