import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
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

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-base font-bold text-white">
            {showCreate ? t('exercise.createTitle', { defaultValue: 'Nuevo ejercicio' }) : t('exercise.addTitle')}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all active:scale-90 bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showCreate ? (
          /* ── Create custom ─────────────────────────────────────────────── */
          <form onSubmit={handleCreateCustom} className="px-6 py-6 flex flex-col gap-5 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{t('exercise.name')}</label>
              <input
                autoFocus required
                value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder={t('exercise.namePlaceholder')}
                className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{t('exercise.type')}</label>
              <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                {Object.values(EXERCISE_TYPES).map(et => (
                  <button key={et} type="button" onClick={() => setCustomType(et)}
                    className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 border
                      ${customType === et ? 'bg-white/20 text-white border-white/30 shadow-sm' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
                    {TYPE_LABELS[et]} {et === EXERCISE_TYPES.WEIGHT_REPS ? t('exercise.typeWeights') : et === EXERCISE_TYPES.BODYWEIGHT ? t('exercise.typeBodyweight', { defaultValue: 'Bodyweight' }) : t('exercise.typeCardio')}
                  </button>
                ))}
              </div>
            </div>

            {customType !== EXERCISE_TYPES.CARDIO && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{t('exercise.muscleGroups', { defaultValue: 'Músculos trabajados' })}</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_MUSCLES.filter(m => m !== 'Cardio').map(m => (
                    <button key={m} type="button" onClick={() => toggleMuscle(m)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 shadow-sm
                        ${customMuscles.includes(m) ? 'text-white border-white/30' : 'bg-black/20 border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}
                      style={customMuscles.includes(m) ? { background: MUSCLE_GROUP_COLORS[m] ?? '#818cf8' } : {}}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 py-3 text-sm font-bold text-white/70 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-95">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={!customName.trim() || isLoading}
                className="flex-1 py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all active:scale-95 border border-white/30 shadow-md">
                {t('common.add')}
              </button>
            </div>
          </form>
        ) : (
          /* ── Catalog browser ───────────────────────────────────────────── */
          <>
            <div className="px-5 pt-5 pb-3 flex flex-col gap-4 flex-shrink-0">
              {/* Search */}
              <input
                autoFocus
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('exercise.searchPlaceholder', { defaultValue: 'Buscar ejercicio…' })}
                className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30"
              />
              {/* Muscle filter pills */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setFilter(null)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 whitespace-nowrap
                    ${!filterMuscle ? 'bg-white/20 text-white border-white/30 shadow-sm' : 'bg-black/20 border-white/10 text-white/50'}`}>
                  {t('exercise.filterAll', { defaultValue: 'All' })}
                </button>
                {ALL_MUSCLES.map(m => (
                  <button key={m} onClick={() => setFilter(m === filterMuscle ? null : m)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 whitespace-nowrap shadow-sm
                      ${filterMuscle === m ? 'text-white border-white/30' : 'bg-black/20 border-white/10 text-white/50'}`}
                    style={filterMuscle === m ? { background: MUSCLE_GROUP_COLORS[m] ?? '#818cf8' } : {}}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {loadingCatalog ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-white/40 text-sm py-10 bg-black/10 rounded-2xl border border-white/5 mx-2">{t('exercise.noResults', { defaultValue: 'Sin resultados' })}</p>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  {filtered.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelect(ex)}
                      className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl bg-black/10 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all active:scale-[0.98] text-left group"
                    >
                      <span className="text-2xl drop-shadow-md">{TYPE_LABELS[ex.exercise_type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white/90 truncate group-hover:text-white">{ex.name}</p>
                        {ex.muscle_groups.length > 0 && (
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {ex.muscle_groups.map(m => (
                              <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-md text-white font-bold tracking-wider uppercase shadow-sm"
                                style={{ background: MUSCLE_GROUP_COLORS[m] ?? '#818cf8' }}>
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {ex.is_custom && (
                        <span className="text-[10px] font-bold text-blue-300/80 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 flex-shrink-0 uppercase tracking-widest">custom</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create custom button */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/20 flex-shrink-0">
              <button onClick={() => setShowCreate(true)}
                className="w-full py-3 text-sm font-bold text-white/80 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-95 shadow-sm">
                + {t('exercise.createCustom', { defaultValue: 'Crear ejercicio personalizado' })}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}