import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MUSCLE_GROUP_COLORS, EXERCISE_TYPES } from '../../constants'

function fmtDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default function WorkoutSummaryModal({ workout, onClose }) {
  const { t } = useTranslation('gym')
  const [notes, setNotes] = useState('')

  // Compute muscle groups from exercises (source of truth)
  const muscleGroups = useMemo(() => {
    const seen = new Set()
    for (const ex of workout?.exercises ?? []) {
      for (const g of ex.muscle_groups ?? []) seen.add(g)
    }
    return [...seen]
  }, [workout])

  if (!workout) return null

  const getTypeLabel = (ex) => {
    if (ex.exercise_type === EXERCISE_TYPES.CARDIO)     return '🏃'
    if (ex.exercise_type === EXERCISE_TYPES.BODYWEIGHT)  return '💪'
    return '🏋️'
  }

  const getSetLabel = (ex, s) => {
    if (ex.exercise_type === EXERCISE_TYPES.CARDIO) {
      return [
        s.speed_kmh        ? `${s.speed_kmh} km/h` : null,
        s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : null,
      ].filter(Boolean).join(' · ')
    }
    if (ex.exercise_type === EXERCISE_TYPES.BODYWEIGHT) {
      return [
        s.reps             ? `× ${s.reps}` : null,
        s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : null,
        s.rpe              ? `RPE ${s.rpe}` : null,
      ].filter(Boolean).join(' · ')
    }
    return [
      s.weight_kg != null ? `${s.weight_kg} kg` : null,
      s.reps      != null ? `× ${s.reps}` : null,
      s.rpe       != null ? `RPE ${s.rpe}` : null,
    ].filter(Boolean).join(' · ')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎉</span>
            <h2 className="text-base font-semibold text-slate-800">{t('summary.title')}</h2>
          </div>
          <p className="text-xs text-slate-400">
            {new Date(workout.started_at).toLocaleDateString('default', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('summary.duration'),  value: fmtDuration(workout.duration_minutes) },
              { label: t('summary.exercises'), value: workout.total_exercises ?? '—' },
              { label: t('summary.sets'),      value: workout.total_sets ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-xl font-bold font-mono text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Muscle groups — derived from exercises */}
          {muscleGroups.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                {t('summary.musclesWorked', { defaultValue: 'Músculos trabajados' })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {muscleGroups.map((g) => (
                  <span key={g}
                    className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                    style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#94a3b8' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Exercise list */}
          {workout.exercises?.length > 0 && (
            <div className="flex flex-col gap-3">
              {workout.exercises.map((ex) => (
                <div key={ex.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm">{getTypeLabel(ex)}</span>
                    <span className="text-sm font-medium text-slate-700">{ex.name}</span>
                    {(ex.muscle_groups ?? []).map(g => (
                      <span key={g}
                        className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#94a3b8' }}>
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {ex.sets?.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-slate-300 w-5">S{s.set_number}</span>
                        <span>{getSetLabel(ex, s) || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">{t('summary.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t('summary.notesPlaceholder')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => onClose(notes)}
            className="w-full py-3 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-all"
          >
            {t('summary.close')}
          </button>
        </div>
      </div>
    </div>
  )
}