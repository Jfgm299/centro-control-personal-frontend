import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
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
    <div className="flex items-center justify-center h-64 text-white/50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col pb-32 text-white min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 sticky top-0 z-10 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          <p className="text-white/60 text-sm mt-0.5">{t('subtitle')}</p>
        </div>
        {!activeWorkout && (
          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white text-sm font-semibold rounded-xl flex-shrink-0 backdrop-blur-md shadow-sm border border-white/10 hover:bg-white/20 active:scale-95 transition-all"
          >
            <span className="text-lg leading-none mb-0.5">+</span> {t('start.cta')}
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
      <div className="px-4 mb-5">
        <div className="flex gap-1 bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/10">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab-gym-mobile"
                  className="absolute inset-0 bg-white/20 rounded-lg shadow-sm border border-white/10"
                />
              )}
              <span className="relative z-10">
                {tab === 'overview' ? '📊 Resumen' : '📈 Gráficas'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview — KPIs + Calendario + Mediciones */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4 px-4">
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
        <div className="flex flex-col gap-5 px-4">
          <div style={{ height: 600 }}>
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