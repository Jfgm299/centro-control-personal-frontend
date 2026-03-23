import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Capacitor } from '@capacitor/core'
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore'
import { useExerciseMutations, useSetMutations } from '../../hooks/useExerciseMutations'
import { MUSCLE_GROUP_COLORS, EXERCISE_TYPES } from '../../constants'
import AddExerciseModal from './AddExerciseModal'
import AddSetModal from './AddSetModal'

const IS_MOBILE = Capacitor.isNativePlatform() || window.innerWidth < 768

function useElapsed(startedAt) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function SetRow({ set, type, onDelete }) {
  const { t } = useTranslation('gym')
  const isCardio     = type === EXERCISE_TYPES.CARDIO
  const isBodyweight = type === EXERCISE_TYPES.BODYWEIGHT

  const label = isCardio
    ? [
        set.speed_kmh        ? `${set.speed_kmh} km/h` : null,
        set.incline_percent  ? `${set.incline_percent}% inc` : null,
        set.duration_seconds ? `${Math.round(set.duration_seconds / 60)} min` : null,
      ].filter(Boolean).join(' · ')
    : isBodyweight
    ? [
        set.reps             ? `× ${set.reps}` : null,
        set.duration_seconds ? `${Math.round(set.duration_seconds / 60)} min` : null,
        set.rpe              ? `RPE ${set.rpe}` : null,
      ].filter(Boolean).join(' · ')
    : [
        set.weight_kg != null ? `${set.weight_kg} kg` : null,
        set.reps      != null ? `× ${set.reps}` : null,
        set.rpe       != null ? `RPE ${set.rpe}` : null,
      ].filter(Boolean).join(' · ')

  return (
    <div className="flex items-center justify-between group py-1.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-white/20 text-xs w-4 font-mono">│</span>
        <span className="text-[10px] text-white/50 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded">S{set.set_number}</span>
        <span className="text-sm font-medium text-white/80">{label || '—'}</span>
      </div>
      <button
        onClick={() => onDelete(set.id)}
        className={`text-white/30 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg p-1.5 transition-all
          ${IS_MOBILE ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >✕</button>
    </div>
  )
}

function ExerciseBlock({ exercise, workoutId }) {
  const { t } = useTranslation('gym')
  const [showAddSet, setShowAddSet] = useState(false)
  const { add: addSet, remove: removeSet } = useSetMutations(workoutId, exercise.id)
  const { remove: removeExercise } = useExerciseMutations(workoutId)

  const handleAddSet = async (payload) => {
    const set_ = await addSet.mutateAsync(payload)
    useActiveWorkoutStore.getState().addSet(exercise.id, set_)
    setShowAddSet(false)
  }

  const handleDeleteSet = async (setId) => {
    await removeSet.mutateAsync(setId)
    useActiveWorkoutStore.getState().removeSet(exercise.id, setId)
  }

  const handleDeleteExercise = async () => {
    await removeExercise.mutateAsync(exercise.id)
    useActiveWorkoutStore.getState().removeExercise(exercise.id)
  }

  const type = exercise.exercise_type
  const typeLabel = type === EXERCISE_TYPES.CARDIO
    ? '🏃 Cardio'
    : type === EXERCISE_TYPES.BODYWEIGHT
    ? '💪 Bodyweight'
    : '🏋️ Weights'
  const typeColor = type === EXERCISE_TYPES.CARDIO
    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    : type === EXERCISE_TYPES.BODYWEIGHT
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'

  return (
    <div className="ml-2 mt-4 bg-black/20 rounded-2xl p-4 border border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between group gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-base font-bold text-white">{exercise.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${typeColor}`}>
            {typeLabel}
          </span>
          {(exercise.muscle_groups || []).map(g => (
            <span key={g} className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold tracking-wider shadow-sm"
              style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#818cf8' }}>
              {g}
            </span>
          ))}
        </div>
        <div className={`flex items-center gap-2 transition-opacity
          ${IS_MOBILE ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={() => setShowAddSet(true)}
            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10"
          >
            + {t('set.add')}
          </button>
          <button
            onClick={handleDeleteExercise}
            className="w-7 h-7 flex items-center justify-center text-white/40 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-xl transition-all"
          >✕</button>
        </div>
      </div>

      <div className="ml-2 pl-3 border-l-2 border-white/10">
        {exercise.sets.map((s) => (
          <SetRow key={s.id} set={s} type={type} onDelete={handleDeleteSet} />
        ))}
        {exercise.sets.length === 0 && (
          <p className="text-xs text-white/40 py-2 italic">{t('set.empty')}</p>
        )}
      </div>

      {showAddSet && (
        <AddSetModal
          exercise={exercise}
          onAdd={handleAddSet}
          onClose={() => setShowAddSet(false)}
          isLoading={addSet.isPending}
        />
      )}
    </div>
  )
}

export default function ActiveWorkout({ onEnd }) {
  const { t } = useTranslation('gym')
  const { workout, startedAt, exercises } = useActiveWorkoutStore()
  const [showAddExercise, setShowAddExercise] = useState(false)
  const { add: addExercise } = useExerciseMutations(workout?.id)
  const elapsed = useElapsed(startedAt)

  // Muscle groups computed dynamically from exercises
  const dynamicMuscleGroups = useMemo(() => {
    const seen = new Set()
    for (const ex of exercises) {
      for (const g of (ex.muscle_groups || [])) seen.add(g)
    }
    return [...seen]
  }, [exercises])

  const handleAddExercise = async (payload) => {
    const ex = await addExercise.mutateAsync(payload)
    useActiveWorkoutStore.getState().addExercise({ ...ex, sets: [] })
    setShowAddExercise(false)
  }

  if (!workout) return null

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-5 md:p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2 bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t('active.inProgress')}</span>
          </div>
          <h2 className="text-lg font-bold text-white">{t('active.title')}</h2>
          {/* Muscle groups — computed live from exercises */}
          {dynamicMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {dynamicMuscleGroups.map((g) => (
                <span key={g}
                  className="text-[10px] px-2.5 py-0.5 rounded-full text-white font-bold tracking-wider shadow-sm"
                  style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#818cf8' }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right bg-black/20 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="text-3xl font-mono font-black text-white drop-shadow-md">{elapsed}</p>
          <p className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-widest">{t('active.elapsed')}</p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-2 mt-4">
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 bg-black/10 rounded-2xl border border-white/5 mt-4">
            <span className="text-3xl opacity-50">🏋️</span>
            <p className="text-sm font-medium text-white/50">{t('active.noExercises')}</p>
          </div>
        ) : (
          exercises.map((ex) => (
            <ExerciseBlock key={ex.id} exercise={ex} workoutId={workout.id} />
          ))
        )}
      </div>

      <div className="flex gap-3 mt-6 pt-5 border-t border-white/10">
        <button
          onClick={() => setShowAddExercise(true)}
          className="flex-1 py-3 text-sm font-bold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all shadow-sm"
        >
          + {t('exercise.add')}
        </button>
        <button
          onClick={onEnd}
          className="flex-1 py-3 text-sm font-bold bg-red-500/30 text-red-100 border border-red-500/50 rounded-xl hover:bg-red-500/50 hover:text-white transition-all shadow-lg backdrop-blur-md"
        >
          ■ {t('active.finish')}
        </button>
      </div>

      {showAddExercise && (
        <AddExerciseModal
          onAdd={handleAddExercise}
          onClose={() => setShowAddExercise(false)}
          isLoading={addExercise.isPending}
        />
      )}
    </div>
  )
}