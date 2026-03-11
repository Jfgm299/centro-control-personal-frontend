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
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-3 text-xs">
      <p className="font-semibold text-white/70 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-mono font-bold text-white">{p.value}</span>
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
    <div className="bg-white/10 rounded-3xl border border-white/20 shadow-lg backdrop-blur-xl p-6">
      <h3 className="text-base font-bold text-white mb-1">{t('progress.title')}</h3>
      <p className="text-xs text-white/60 mb-5">{t('progress.subtitle')}</p>

      {/* Muscle group selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => handleGroupSelect(group)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all
              ${selectedGroup === group
                ? 'text-white border-transparent shadow-md'
                : 'bg-black/20 text-white/60 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            style={selectedGroup === group ? { background: MUSCLE_GROUP_COLORS[group] ?? '#818cf8' } : {}}
          >
            {t(`muscles.${group}`, { defaultValue: group })}
          </button>
        ))}
        {isLoadingDetails && (
          <span className="text-xs text-white/40 self-center">Loading…</span>
        )}
      </div>

      {/* Exercise selector */}
      {selectedGroup && exerciseMap[selectedGroup] && (
        <div className="flex flex-wrap gap-2 mb-6 pl-3 border-l-2 py-1"
          style={{ borderColor: MUSCLE_GROUP_COLORS[selectedGroup] ?? '#818cf8' }}>
          {exerciseMap[selectedGroup].map((name) => (
            <button
              key={name}
              onClick={() => setSelectedExercise(name === selectedExercise ? null : name)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all
                ${selectedExercise === name
                  ? 'bg-white/20 text-white border-white/30 shadow-inner'
                  : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/30'
                }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {selectedExercise && progression.length > 0 ? (
        <div className="bg-black/10 rounded-2xl p-4 border border-white/5">
          <p className="text-sm font-bold text-white mb-4 pl-2">{selectedExercise}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progression}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              {!isCardio && (
                <YAxis yAxisId="right" orientation="right"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />

              {isCardio ? (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="distanceKm"
                    name={t('progress.distance')} stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                  <Line yAxisId="left" type="monotone" dataKey="avgSpeedKmh"
                    name={t('progress.speed')} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                </>
              ) : (
                <>
                  <Line yAxisId="left" type="monotone" dataKey="weight"
                    name={t('progress.weight')} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                  <Line yAxisId="right" type="monotone" dataKey="reps"
                    name={t('progress.reps')} stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} strokeDasharray="4 2" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : selectedExercise ? (
        <p className="text-sm text-white/40 text-center py-8 bg-black/10 rounded-2xl border border-white/5">{t('progress.noData')}</p>
      ) : (
        <p className="text-sm text-white/40 text-center py-8 bg-black/10 rounded-2xl border border-white/5">
          {muscleGroups.length === 0 ? t('progress.empty') : t('progress.selectHint')}
        </p>
      )}
    </div>
  )
}