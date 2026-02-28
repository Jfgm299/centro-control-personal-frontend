/**
 * constants.js — espeja exactamente los enums del backend.
 * Si el backend cambia, solo hay que tocar este archivo.
 */

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Biceps', 'Triceps', 'Core', 'Abs', 'Shoulders', 'Legs',
]

export const EXERCISE_TYPES = {
  WEIGHT_REPS: 'Weight_reps',
  CARDIO:      'Cardio',
}

export const MUSCLE_GROUP_COLORS = {
  Chest:     '#6366f1',
  Back:      '#8b5cf6',
  Biceps:    '#ec4899',
  Triceps:   '#f43f5e',
  Core:      '#f59e0b',
  Abs:       '#f97316',
  Shoulders: '#14b8a6',
  Legs:      '#22c55e',
}