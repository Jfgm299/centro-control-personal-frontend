import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkouts } from './hooks/useWorkouts'
import { useWorkoutMutations } from './hooks/useWorkoutMutations'
import { useWorkoutDetail } from './hooks/useWorkouts'
import { useActiveWorkoutStore } from './store/activeWorkoutStore'
import { getWorkoutDays, computeKPIs, getSessionChartData } from './hooks/useWorkoutAnalytics'

import StartWorkoutModal from './components/StartWorkoutModal'
import ActiveWorkout from './components/active/ActiveWorkout'
import WorkoutSummaryModal from './components/active/WorkoutSummaryModal'
import WorkoutCalendar from './components/analytics/WorkoutCalendar'
import WorkoutKPIs from './components/analytics/WorkoutKPIs'
import WorkoutCharts from './components/analytics/WorkoutCharts'
import ExerciseProgressChart from './components/analytics/ExerciseProgressChart'

export default function GymPage() {
  const { t } = useTranslation('gym')
  const { data: workouts = [], isLoading } = useWorkouts()
  const { start, end } = useWorkoutMutations()
  const { workout: activeWorkout, startWorkout, clearWorkout } = useActiveWorkoutStore()

  const [showStartModal, setShowStartModal] = useState(false)
  const [finishedWorkoutId, setFinishedWorkoutId] = useState(null)

  // Load finished workout detail for summary modal
  const { data: finishedWorkoutDetail } = useWorkoutDetail(finishedWorkoutId)

  // Analytics
  const workoutDays  = useMemo(() => getWorkoutDays(workouts), [workouts])
  const kpis         = useMemo(() => computeKPIs(workouts), [workouts])
  const sessionData  = useMemo(() => getSessionChartData(workouts), [workouts])

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

  const handleCloseSummary = () => {
    setFinishedWorkoutId(null)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        {!activeWorkout && (
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all flex-shrink-0"
          >
            <span>+</span> {t('start.cta')}
          </button>
        )}
      </div>

      {/* Active workout — shown at the top when in progress */}
      {activeWorkout && (
        <ActiveWorkout onEnd={handleEndWorkout} />
      )}

      {/* Analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Left: calendar + KPIs */}
        <div className="flex flex-col gap-4">
          <WorkoutCalendar workoutDays={workoutDays} />
          <WorkoutKPIs kpis={kpis} />
        </div>

        {/* Right: charts */}
        <div className="lg:col-span-2">
          <WorkoutCharts sessionData={sessionData} />
        </div>
      </div>

      {/* Exercise progression */}
      <ExerciseProgressChart />

      {/* Modals */}
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
          onClose={handleCloseSummary}
        />
      )}
    </div>
  )
}