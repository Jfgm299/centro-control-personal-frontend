/**
 * activeWorkoutStore.js — estado del workout en curso.
 *
 * Persiste en localStorage para que si el usuario recarga la página
 * mientras tiene un workout activo, no lo pierda.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useActiveWorkoutStore = create(
  persist(
    (set, get) => ({
      // Workout en curso — null si no hay ninguno
      workout: null,
      // Timestamp de inicio (para el cronómetro)
      startedAt: null,
      // Ejercicios añadidos durante la sesión (estructura árbol)
      exercises: [], // [{ id, name, exercise_type, sets: [] }]

      startWorkout: (workout) =>
        set({
          workout,
          startedAt: workout.started_at,
          exercises: [],
        }),

      addExercise: (exercise) =>
        set((state) => ({
          exercises: [...state.exercises, { ...exercise, sets: [] }],
        })),

      addSet: (exerciseId, set_) =>
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === exerciseId
              ? { ...ex, sets: [...ex.sets, set_] }
              : ex
          ),
        })),

      removeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === exerciseId
              ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
              : ex
          ),
        })),

      removeExercise: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.id !== exerciseId),
        })),

      clearWorkout: () =>
        set({ workout: null, startedAt: null, exercises: [] }),
    }),
    { name: 'active-workout' }
  )
)