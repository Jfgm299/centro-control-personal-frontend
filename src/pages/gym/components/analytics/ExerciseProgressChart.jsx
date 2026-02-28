import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useWorkouts, useWorkoutDetails } from '../../hooks/useWorkouts'
import {
  groupExercisesByMuscle,
  getExerciseProgression,
} from '../../hooks/useWorkoutAnalytics'
import { MUSCLE_GROUP_COLORS, EXERCISE_TYPES } from '../../constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl p-3 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-mono font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ExerciseProgressChart() {
  const { t } = useTranslation('gym')
  const { data: workouts = [] } = useWorkouts()
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState(null)

  // Carga todos los workouts en detalle (paralelo, con caché)
  const completedIds = workouts.filter((w) => w.ended_at).map((w) => w.id)
  const detailQueries = useWorkoutDetails(completedIds)
  const detailedWorkouts = detailQueries
    .filter((q) => q.data)
    .map((q) => q.data)
  const isLoadingDetails = detailQueries.some((q) => q.isLoading)

  const exerciseMap = useMemo(
    () => groupExercisesByMuscle(detailedWorkouts),
    [detailedWorkouts]
  )

  const muscleGroups = Object.keys(exerciseMap).sort()

  const progression = useMemo(() => {
    if (!selectedExercise) return []
    return getExerciseProgression(detailedWorkouts, selectedExercise)
  }, [detailedWorkouts, selectedExercise])

  const isCardio = useMemo(() => {
    if (!selectedExercise || !detailedWorkouts.length) return false
    const ex = detailedWorkouts
      .flatMap((w) => w.exercises ?? [])
      .find((e) => e.name.toLowerCase() === selectedExercise.toLowerCase())
    return ex?.exercise_type === EXERCISE_TYPES.CARDIO
  }, [selectedExercise, detailedWorkouts])

  const handleGroupSelect = (group) => {
    setSelectedGroup(group === selectedGroup ? null : group)
    setSelectedExercise(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{t('progress.title')}</h3>
      <p className="text-xs text-slate-400 mb-4">{t('progress.subtitle')}</p>

      {/* Muscle group selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => handleGroupSelect(group)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${selectedGroup === group
                ? 'text-white border-transparent'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            style={selectedGroup === group ? { background: MUSCLE_GROUP_COLORS[group] ?? '#6366f1' } : {}}
          >
            {t(`muscles.${group}`, { defaultValue: group })}
          </button>
        ))}
        {isLoadingDetails && (
          <span className="text-xs text-slate-400 self-center">Loading…</span>
        )}
      </div>

      {/* Exercise selector */}
      {selectedGroup && exerciseMap[selectedGroup] && (
        <div className="flex flex-wrap gap-1.5 mb-5 pl-1 border-l-2"
          style={{ borderColor: MUSCLE_GROUP_COLORS[selectedGroup] }}>
          {exerciseMap[selectedGroup].map((name) => (
            <button
              key={name}
              onClick={() => setSelectedExercise(name === selectedExercise ? null : name)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                ${selectedExercise === name
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {selectedExercise && progression.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-3">{selectedExercise}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progression}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              {!isCardio && (
                <YAxis yAxisId="right" orientation="right"
                  tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />

              {isCardio ? (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="distanceKm"
                    name={t('progress.distance')} stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgSpeedKmh"
                    name={t('progress.speed')} stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
                </>
              ) : (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="weight"
                    name={t('progress.weight')} stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="reps"
                    name={t('progress.reps')} stroke="#a5b4fc" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : selectedExercise ? (
        <p className="text-sm text-slate-400 text-center py-8">{t('progress.noData')}</p>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">
          {muscleGroups.length === 0 ? t('progress.empty') : t('progress.selectHint')}
        </p>
      )}
    </div>
  )
}