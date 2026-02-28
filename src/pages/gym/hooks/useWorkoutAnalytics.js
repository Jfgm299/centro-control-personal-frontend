/**
 * useWorkoutAnalytics.js — funciones puras de agregación.
 * No hacen fetch, solo transforman datos ya cargados.
 * Fáciles de testear y reutilizar en widgets del Home.
 */

/** Días únicos en que hubo workout — para el calendario */
export function getWorkoutDays(workouts = []) {
  return new Set(workouts.map((w) => w.started_at.slice(0, 10)))
}

/** KPIs generales a partir de la lista simple de workouts */
export function computeKPIs(workouts = []) {
  const completed = workouts.filter((w) => w.ended_at)
  if (!completed.length) return null

  const totalMinutes = completed.reduce((s, w) => s + (w.duration_minutes ?? 0), 0)
  const totalExercises = completed.reduce((s, w) => s + (w.total_exercises ?? 0), 0)
  const totalSets = completed.reduce((s, w) => s + (w.total_sets ?? 0), 0)

  // Media por semana
  const dates = completed.map((w) => new Date(w.started_at))
  const oldest = new Date(Math.min(...dates))
  const newest = new Date(Math.max(...dates))
  const weeks = Math.max(1, (newest - oldest) / (1000 * 60 * 60 * 24 * 7))
  const perWeek = completed.length / weeks

  // Racha actual
  let streak = 0
  const daySet = getWorkoutDays(completed)
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (daySet.has(d.toISOString().slice(0, 10))) streak++
    else if (i > 0) break
  }

  return {
    total: completed.length,
    totalMinutes,
    avgMinutes: Math.round(totalMinutes / completed.length),
    totalExercises,
    totalSets,
    perWeek: Math.round(perWeek * 10) / 10,
    streak,
  }
}

/**
 * Extrae todos los ejercicios de workouts detallados,
 * agrupados por muscle_group → exercise name.
 * Devuelve estructura: { [muscleGroup]: Set<exerciseName> }
 */
export function groupExercisesByMuscle(detailedWorkouts = []) {
  const map = {}
  for (const workout of detailedWorkouts) {
    const groups = workout.muscle_groups ?? []
    for (const ex of workout.exercises ?? []) {
      // Asociamos el ejercicio a todos los grupos del workout
      for (const group of groups) {
        if (!map[group]) map[group] = new Set()
        map[group].add(ex.name)
      }
    }
  }
  // Convertir Sets a arrays para serialización
  return Object.fromEntries(Object.entries(map).map(([g, s]) => [g, [...s]]))
}

/**
 * Evolución de un ejercicio concreto a lo largo del tiempo.
 * Devuelve array de puntos para el gráfico.
 */
export function getExerciseProgression(detailedWorkouts = [], exerciseName) {
  const points = []
  for (const workout of detailedWorkouts) {
    const ex = (workout.exercises ?? []).find(
      (e) => e.name.toLowerCase() === exerciseName.toLowerCase()
    )
    if (!ex) continue
    const date = workout.started_at.slice(0, 10)

    if (ex.exercise_type === 'Weight_reps') {
      // Mejor set de ese día: mayor volumen (weight × reps)
      const best = ex.sets.reduce((top, s) => {
        const vol = (s.weight_kg ?? 0) * (s.reps ?? 0)
        return vol > (top.vol ?? 0) ? { ...s, vol } : top
      }, {})
      points.push({
        date,
        weight: best.weight_kg,
        reps: best.reps,
        volume: best.vol,
        rpe: best.rpe,
      })
    } else {
      // Cardio: distancia estimada = speed * (duration/3600)
      const totalDistance = ex.sets.reduce(
        (s, set_) => s + (set_.speed_kmh ?? 0) * ((set_.duration_seconds ?? 0) / 3600),
        0
      )
      const avgSpeed =
        ex.sets.reduce((s, set_) => s + (set_.speed_kmh ?? 0), 0) / (ex.sets.length || 1)
      points.push({
        date,
        distanceKm: Math.round(totalDistance * 100) / 100,
        avgSpeedKmh: Math.round(avgSpeed * 10) / 10,
      })
    }
  }
  return points.sort((a, b) => a.date.localeCompare(b.date))
}

/** Datos para el gráfico de ejercicios por sesión */
export function getSessionChartData(workouts = []) {
  return workouts
    .filter((w) => w.ended_at)
    .sort((a, b) => a.started_at.localeCompare(b.started_at))
    .map((w) => ({
      date: w.started_at.slice(0, 10),
      exercises: w.total_exercises ?? 0,
      sets: w.total_sets ?? 0,
      minutes: w.duration_minutes ?? 0,
    }))
}