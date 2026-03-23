import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
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

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl drop-shadow-md">🎉</span>
            <h2 className="text-xl font-bold text-white">{t('summary.title')}</h2>
          </div>
          <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-1 pl-9">
            {new Date(workout.started_at).toLocaleDateString('default', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6 flex flex-col gap-6">

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('summary.duration'),  value: fmtDuration(workout.duration_minutes) },
              { label: t('summary.exercises'), value: workout.total_exercises ?? '—' },
              { label: t('summary.sets'),      value: workout.total_sets ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-black/20 rounded-2xl p-3 text-center border border-white/5 backdrop-blur-sm shadow-inner">
                <p className="text-[10px] text-white/40 mb-1 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black font-mono text-white drop-shadow-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Muscle groups — derived from exercises */}
          {muscleGroups.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                {t('summary.musclesWorked', { defaultValue: 'Músculos trabajados' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {muscleGroups.map((g) => (
                  <span key={g}
                    className="text-[10px] px-2.5 py-1 rounded-full text-white font-bold tracking-wider shadow-sm"
                    style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#60a5fa' }}>
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
                <div key={ex.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-lg drop-shadow-sm">{getTypeLabel(ex)}</span>
                    <span className="text-sm font-bold text-white/90">{ex.name}</span>
                    {(ex.muscle_groups ?? []).map(g => (
                      <span key={g}
                        className="text-[9px] px-1.5 py-0.5 rounded-md text-white font-bold tracking-wider uppercase shadow-sm"
                        style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#60a5fa' }}>
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 pl-2 border-l-2 border-white/10">
                    {ex.sets?.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-white/30 font-bold bg-white/5 px-1 rounded">S{s.set_number}</span>
                        <span className="text-white/70 font-medium">{getSetLabel(ex, s) || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('summary.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t('summary.notesPlaceholder')}
              className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 resize-none transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="px-6 py-5 border-t border-white/10 flex-shrink-0 bg-black/20">
          <button
            onClick={() => onClose(notes)}
            className="w-full py-4 text-sm font-bold bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-all border border-white/20 shadow-lg drop-shadow-sm"
          >
            {t('summary.close')}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}