import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EXERCISE_TYPES, MUSCLE_GROUP_COLORS } from '../../constants'

function fmtDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default function WorkoutSummaryModal({ workout, onClose }) {
  const { t } = useTranslation('gym')
  const [notes, setNotes] = useState('')

  if (!workout) return null

  const isCardio = (ex) => ex.exercise_type === EXERCISE_TYPES.CARDIO

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎉</span>
            <h2 className="text-base font-semibold text-slate-800">{t('summary.title')}</h2>
          </div>
          <p className="text-xs text-slate-400">{new Date(workout.started_at).toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('summary.duration'),    value: fmtDuration(workout.duration_minutes) },
              { label: t('summary.exercises'),   value: workout.total_exercises ?? '—' },
              { label: t('summary.sets'),        value: workout.total_sets ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-xl font-bold font-mono text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Muscle groups */}
          {workout.muscle_groups?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {workout.muscle_groups.map((g) => (
                <span key={g} className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                  style={{ background: MUSCLE_GROUP_COLORS[g] ?? '#94a3b8' }}>
                  {t(`muscles.${g}`, { defaultValue: g })}
                </span>
              ))}
            </div>
          )}

          {/* Exercise list */}
          {workout.exercises?.length > 0 && (
            <div className="flex flex-col gap-3">
              {workout.exercises.map((ex) => (
                <div key={ex.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-700">{ex.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium
                      ${isCardio(ex) ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500'}`}>
                      {isCardio(ex) ? '🏃' : '🏋️'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {ex.sets?.map((s) => {
                      const label = isCardio(ex)
                        ? [s.speed_kmh ? `${s.speed_kmh} km/h` : null, s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : null].filter(Boolean).join(' · ')
                        : [s.weight_kg != null ? `${s.weight_kg} kg` : null, s.reps != null ? `× ${s.reps}` : null, s.rpe != null ? `RPE ${s.rpe}` : null].filter(Boolean).join(' · ')
                      return (
                        <div key={s.id} className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono text-slate-300 w-5">S{s.set_number}</span>
                          <span>{label}</span>
                        </div>
                      )
                    })}
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