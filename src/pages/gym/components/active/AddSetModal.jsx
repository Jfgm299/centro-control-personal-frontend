import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EXERCISE_TYPES } from '../../constants'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-slate-600">{label}</label>
    {children}
  </div>
)

const NumberInput = ({ value, onChange, placeholder, min = 0, step = 1 }) => (
  <input
    type="number"
    min={min}
    step={step}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
  />
)

export default function AddSetModal({ exercise, onAdd, onClose, isLoading }) {
  const { t } = useTranslation('gym')
  const isCardio = exercise.exercise_type === EXERCISE_TYPES.CARDIO

  // Weight/reps fields
  const [weight, setWeight]   = useState('')
  const [reps, setReps]       = useState('')
  const [rpe, setRpe]         = useState('')

  // Cardio fields
  const [speed, setSpeed]         = useState('')
  const [incline, setIncline]     = useState('')
  const [duration, setDuration]   = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = isCardio
      ? {
          speed_kmh:        speed   ? parseFloat(speed)   : null,
          incline_percent:  incline ? parseFloat(incline) : null,
          duration_seconds: duration ? parseInt(duration) * 60 : null, // input en minutos
          weight_kg: null, reps: null, rpe: null,
        }
      : {
          weight_kg: weight ? parseFloat(weight) : null,
          reps:      reps   ? parseInt(reps)     : null,
          rpe:       rpe    ? parseInt(rpe)      : null,
          speed_kmh: null, incline_percent: null, duration_seconds: null,
        }
    onAdd(payload)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t('set.addTitle')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{exercise.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {isCardio ? (
            <>
              <Field label={t('set.speed')}>
                <NumberInput value={speed} onChange={setSpeed} placeholder="10.5" step="0.1" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('set.incline')}>
                  <NumberInput value={incline} onChange={setIncline} placeholder="1.5" step="0.5" min={0} />
                </Field>
                <Field label={t('set.durationMin')}>
                  <NumberInput value={duration} onChange={setDuration} placeholder="20" min={1} />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('set.weight')}>
                  <NumberInput value={weight} onChange={setWeight} placeholder="80" step="0.5" />
                </Field>
                <Field label={t('set.reps')}>
                  <NumberInput value={reps} onChange={setReps} placeholder="10" min={1} />
                </Field>
              </div>
              <Field label={`${t('set.rpe')} (1–10)`}>
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => {
                    const val = i + 1
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRpe(String(val))}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all
                          ${rpe === String(val)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          }`}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-all">
              {t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}