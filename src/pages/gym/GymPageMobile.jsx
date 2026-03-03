import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkouts, useWorkoutDetail } from './hooks/useWorkouts'
import { useWorkoutMutations } from './hooks/useWorkoutMutations'
import { useActiveWorkoutStore } from './store/activeWorkoutStore'
import { getWorkoutDays, computeKPIs, getSessionChartData } from './hooks/useWorkoutAnalytics'

import StartWorkoutModal from './components/StartWorkoutModal'
import ActiveWorkout from './components/active/ActiveWorkout'
import WorkoutSummaryModal from './components/active/WorkoutSummaryModal'
import WorkoutCalendarMobile from './components/analytics/WorkoutCalendarMobile'
import WorkoutKPIs from './components/analytics/WorkoutKPIs'
import WorkoutCharts from './components/analytics/WorkoutCharts'
import ExerciseProgressChart from './components/analytics/ExerciseProgressChart'
import BodyMeasuresChart from './components/body/BodyMeasuresChart'

const TABS = ['overview', 'charts']

export default function GymPageMobile() {
  const { t } = useTranslation('gym')
  const { data: workouts = [], isLoading } = useWorkouts()
  const { start, end } = useWorkoutMutations()
  const { workout: activeWorkout, startWorkout, clearWorkout } = useActiveWorkoutStore()

  const [activeTab, setActiveTab] = useState('overview')
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
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col pb-32">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t('subtitle')}</p>
        </div>
        {!activeWorkout && (
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl flex-shrink-0"
          >
            <span>+</span> {t('start.cta')}
          </button>
        )}
      </div>

      {/* Active workout banner */}
      {activeWorkout && (
        <div className="px-4 mb-3">
          <ActiveWorkout onEnd={handleEndWorkout} />
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' ? '📊 Resumen' : '📈 Gráficas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview — KPIs + Calendario + Mediciones */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-3 px-4">
          {/* KPIs compact 2x2 */}
          <WorkoutKPIs kpis={kpis} compact />

          {/* Calendario compacto */}
          <WorkoutCalendarMobile workoutDays={workoutDays} />

          {/* Mediciones corporales */}
          <BodyMeasuresChart />
        </div>
      )}

      {/* Tab: Charts — gráficas de sesiones + progresión ejercicios */}
      {activeTab === 'charts' && (
        <div className="flex flex-col gap-4 px-4">
          <div style={{ height: 500 }}>
            <WorkoutCharts sessionData={sessionData} />
          </div>
          <ExerciseProgressChart />
        </div>
      )}

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