import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkouts, useWorkoutDetail } from './hooks/useWorkouts'
import { useWorkoutMutations } from './hooks/useWorkoutMutations'
import { useActiveWorkoutStore } from './store/activeWorkoutStore'
import { getWorkoutDays, computeKPIs, getSessionChartData } from './hooks/useWorkoutAnalytics'

import StartWorkoutModal from './components/StartWorkoutModal'
import ActiveWorkout from './components/active/ActiveWorkout'
import WorkoutSummaryModal from './components/active/WorkoutSummaryModal'
import WorkoutCalendar from './components/analytics/WorkoutCalendar'
import WorkoutKPIs from './components/analytics/WorkoutKPIs'
import WorkoutCharts from './components/analytics/WorkoutCharts'
import ExerciseProgressChart from './components/analytics/ExerciseProgressChart'
import BodyMeasuresChart from './components/body/BodyMeasuresChart'

export default function GymPageDesktop() {
  const { t } = useTranslation('gym')
  const { data: workouts = [], isLoading } = useWorkouts()
  const { start, end } = useWorkoutMutations()
  const { workout: activeWorkout, startWorkout, clearWorkout } = useActiveWorkoutStore()

  const [showStartModal, setShowStartModal] = useState(false)
  const [finishedWorkoutId, setFinishedWorkoutId] = useState(null)

  const { data: finishedWorkoutDetail } = useWorkoutDetail(finishedWorkoutId)

  const workoutDays = useMemo(() => getWorkoutDays(workouts), [workouts])
  const kpis        = useMemo(() => computeKPIs(workouts), [workouts])
  const sessionData = useMemo(() => getSessionChartData(workouts), [workouts])

  const handleStartWorkout = async (payload) => {
    const workout = await start.mutateAsync(payload)
    startWorkout({ ...workout, muscle_groups: payload.muscle_groups })
    setShowStartModal(false)
  }

  const handleEndWorkout = async () => {
    if (!activeWorkout) return
    await end.mutateAsync({ workoutId: activeWorkout.id, notes: null })
    setFinishedWorkoutId(activeWorkout.id)
    clearWorkout()
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-white/50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 text-white p-4 md:p-6 pb-20 max-w-7xl mx-auto">
      <div className="flex items-start justify-between pt-4 sticky top-0 z-10 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          <p className="text-white/60 mt-1">{t('subtitle')}</p>
        </div>
        {!activeWorkout && (
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm border border-white/10"
          >
            <span className="text-lg leading-none mb-0.5">+</span> {t('start.cta')}
          </button>
        )}
      </div>

      {activeWorkout && (
        <ActiveWorkout onEnd={handleEndWorkout} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex flex-col gap-6">
          <WorkoutCalendar workoutDays={workoutDays} />
          <WorkoutKPIs kpis={kpis} />
        </div>
        <div className="lg:col-span-2">
          <WorkoutCharts sessionData={sessionData} />
        </div>
      </div>

      <BodyMeasuresChart />

      <ExerciseProgressChart />

      {showStartModal && (
        <StartWorkoutModal
          onStart={handleStartWorkout}
          onClose={() => setShowStartModal(false)}
          isLoading={start.isPending}
        />
      )}
      {finishedWorkoutDetail && (
        <WorkoutSummaryModal
          workout={finishedWorkoutDetail}
          onClose={() => setFinishedWorkoutId(null)}
        />
      )}
    </div>
  )
}