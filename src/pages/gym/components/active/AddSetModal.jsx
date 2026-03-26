import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { EXERCISE_TYPES } from '../../constants'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-white/60 uppercase tracking-widest">{label}</label>
    {children}
  </div>
)

const NumberInput = ({ value, onChange, placeholder, min = 0, step = 1 }) => (
  <input
    type="number" min={min} step={step} value={value}
    onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
  />
)

export default function AddSetModal({ exercise, onAdd, onClose, isLoading }) {
  const { t } = useTranslation('gym')
  const type = exercise.exercise_type

  const isCardio     = type === EXERCISE_TYPES.CARDIO
  const isBodyweight = type === EXERCISE_TYPES.BODYWEIGHT

  const [weight, setWeight]   = useState('')
  const [reps, setReps]       = useState('')
  const [rpe, setRpe]         = useState('')
  const [speed, setSpeed]     = useState('')
  const [incline, setIncline] = useState('')
  const [duration, setDuration] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    let payload

    if (isCardio) {
      payload = {
        speed_kmh:        speed    ? parseFloat(speed)   : null,
        incline_percent:  incline  ? parseFloat(incline) : null,
        duration_seconds: duration ? parseInt(duration) * 60 : null,
        weight_kg: null, reps: null, rpe: null,
      }
    } else if (isBodyweight) {
      payload = {
        reps:             reps     ? parseInt(reps)      : null,
        duration_seconds: duration ? parseInt(duration) * 60 : null,
        rpe:              rpe      ? parseInt(rpe)       : null,
        weight_kg: null, speed_kmh: null, incline_percent: null,
      }
    } else {
      payload = {
        weight_kg: weight ? parseFloat(weight) : null,
        reps:      reps   ? parseInt(reps)     : null,
        rpe:       rpe    ? parseInt(rpe)      : null,
        speed_kmh: null, incline_percent: null, duration_seconds: null,
      }
    }
    onAdd(payload)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{t('set.addTitle')}</h2>
            <p className="text-xs text-white/60 mt-0.5">{exercise.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all active:scale-90 bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-transparent hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5 overflow-y-auto flex-1">
          {isCardio && (
            <>
              <Field label={t('set.speed')}>
                <NumberInput value={speed} onChange={setSpeed} placeholder="10.5" step="0.1" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('set.incline')}>
                  <NumberInput value={incline} onChange={setIncline} placeholder="1.5" step="0.5" />
                </Field>
                <Field label={t('set.durationMin')}>
                  <NumberInput value={duration} onChange={setDuration} placeholder="20" min={1} />
                </Field>
              </div>
            </>
          )}

          {isBodyweight && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('set.reps')}>
                  <NumberInput value={reps} onChange={setReps} placeholder="15" min={1} />
                </Field>
                <Field label={`${t('set.durationMin')} (${t('set.optional', { defaultValue: 'opcional' })})`}>
                  <NumberInput value={duration} onChange={setDuration} placeholder="1" min={1} />
                </Field>
              </div>
              <Field label={`${t('set.rpe')} (1–10)`}>
                <div className="grid grid-cols-5 gap-1.5">
                  {[...Array(10)].map((_, i) => {
                    const val = i + 1
                    return (
                      <button key={val} type="button" onClick={() => setRpe(String(val))}
                        className={`py-2 text-[11px] font-bold rounded-lg border transition-all active:scale-95 shadow-sm
                          ${rpe === String(val) ? 'bg-white/20 text-white border-white/40 shadow-inner' : 'bg-black/20 border-white/5 text-white/50 hover:border-white/20 hover:text-white'}`}>
                        {val}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </>
          )}

          {!isCardio && !isBodyweight && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('set.weight')}>
                  <NumberInput value={weight} onChange={setWeight} placeholder="80" step="0.5" />
                </Field>
                <Field label={t('set.reps')}>
                  <NumberInput value={reps} onChange={setReps} placeholder="10" min={1} />
                </Field>
              </div>
              <Field label={`${t('set.rpe')} (1–10)`}>
                <div className="grid grid-cols-5 gap-1.5">
                  {[...Array(10)].map((_, i) => {
                    const val = i + 1
                    return (
                      <button key={val} type="button" onClick={() => setRpe(String(val))}
                        className={`py-2 text-[11px] font-bold rounded-lg border transition-all active:scale-95 shadow-sm
                          ${rpe === String(val) ? 'bg-white/20 text-white border-white/40 shadow-inner' : 'bg-black/20 border-white/5 text-white/50 hover:border-white/20 hover:text-white'}`}>
                        {val}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </>
          )}

          <div className="flex gap-3 pt-3 border-t border-white/10 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-white/70 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 text-sm font-bold bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-40 transition-all active:scale-95 border border-white/30 shadow-md"
            >
              {t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}