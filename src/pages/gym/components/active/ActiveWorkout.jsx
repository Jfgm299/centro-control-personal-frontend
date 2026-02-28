import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore'
import { useExerciseMutations, useSetMutations } from '../../hooks/useExerciseMutations'
import { MUSCLE_GROUP_COLORS, EXERCISE_TYPES } from '../../constants'
import AddExerciseModal from './AddExerciseModal'
import AddSetModal from './AddSetModal'

/** Cronómetro en vivo */
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

/** Línea de un set */
function SetRow({ set, type, onDelete }) {
  const { t } = useTranslation('gym')
  const isCardio = type === EXERCISE_TYPES.CARDIO
  const label = isCardio
    ? [
        set.speed_kmh    ? `${set.speed_kmh} km/h` : null,
        set.incline_percent ? `${set.incline_percent}% inc` : null,
        set.duration_seconds ? `${Math.round(set.duration_seconds / 60)} min` : null,
      ].filter(Boolean).join(' · ')
    : [
        set.weight_kg != null ? `${set.weight_kg} kg` : null,
        set.reps       != null ? `× ${set.reps}` : null,
        set.rpe        != null ? `RPE ${set.rpe}` : null,
      ].filter(Boolean).join(' · ')

  return (
    <div className="flex items-center justify-between group py-1">
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-xs w-4">│</span>
        <span className="text-xs text-slate-400 font-mono">S{set.set_number}</span>
        <span className="text-xs text-slate-600">{label || '—'}</span>
      </div>
      <button
        onClick={() => onDelete(set.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-xs px-1"
      >✕</button>
    </div>
  )
}

/** Bloque de un ejercicio con sus sets */
function ExerciseBlock({ exercise, workoutId, onDeleteExercise }) {
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
    onDeleteExercise?.()
  }

  const isCardio = exercise.exercise_type === EXERCISE_TYPES.CARDIO

  return (
    <div className="ml-4 mt-2">
      {/* Exercise header */}
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm">├─</span>
          <span className="text-sm font-medium text-slate-700">{exercise.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium
            ${isCardio ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500'}`}>
            {isCardio ? '🏃 Cardio' : '🏋️ Weights'}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAddSet(true)}
            className="text-xs px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
          >
            + {t('set.add')}
          </button>
          <button
            onClick={handleDeleteExercise}
            className="text-xs text-slate-300 hover:text-red-400 transition-colors px-1"
          >✕</button>
        </div>
      </div>

      {/* Sets */}
      <div className="ml-6">
        {exercise.sets.map((s) => (
          <SetRow key={s.id} set={s} type={exercise.exercise_type} onDelete={handleDeleteSet} />
        ))}
        {exercise.sets.length === 0 && (
          <p className="text-xs text-slate-300 ml-6 mt-1">{t('set.empty')}</p>
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

/** Vista principal del workout en curso */
export default function ActiveWorkout({ onEnd }) {
  const { t } = useTranslation('gym')
  const { workout, startedAt, exercises } = useActiveWorkoutStore()
  const [showAddExercise, setShowAddExercise] = useState(false)
  const { add: addExercise } = useExerciseMutations(workout?.id)
  const elapsed = useElapsed(startedAt)

  const handleAddExercise = async (payload) => {
    const ex = await addExercise.mutateAsync(payload)
    useActiveWorkoutStore.getState().addExercise({ ...ex, sets: [] })
    setShowAddExercise(false)
  }

  if (!workout) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Workout header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-600">{t('active.inProgress')}</span>
          </div>
          <h2 className="text-base font-semibold text-slate-800">{t('active.title')}</h2>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {workout.muscle_groups?.map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#94a3b8' }}
              >
                {t(`muscles.${g}`, { defaultValue: g })}
              </span>
            ))}
          </div>
        </div>

        {/* Cronómetro */}
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-slate-800">{elapsed}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t('active.elapsed')}</p>
        </div>
      </div>

      {/* Árbol de ejercicios */}
      <div className="border-t border-slate-50 pt-4">
        {exercises.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">{t('active.noExercises')}</p>
        ) : (
          exercises.map((ex) => (
            <ExerciseBlock key={ex.id} exercise={ex} workoutId={workout.id} />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5 pt-4 border-t border-slate-50">
        <button
          onClick={() => setShowAddExercise(true)}
          className="flex-1 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
        >
          + {t('exercise.add')}
        </button>
        <button
          onClick={onEnd}
          className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-all"
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