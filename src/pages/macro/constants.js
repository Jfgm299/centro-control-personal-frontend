export const MEAL_TYPES = [
  { key: 'breakfast',       icon: '🌅', order: 0 },
  { key: 'morning_snack',   icon: '🍎', order: 1 },
  { key: 'lunch',           icon: '🍽️',  order: 2 },
  { key: 'afternoon_snack', icon: '🫐', order: 3 },
  { key: 'dinner',          icon: '🌙', order: 4 },
  { key: 'other',           icon: '🍫', order: 5 },
]

export const NUTRIENT_COLORS = {
  energy_kcal:     '#f59e0b',
  proteins_g:      '#3b82f6',
  carbohydrates_g: '#10b981',
  fat_g:           '#f43f5e',
  fiber_g:         '#8b5cf6',
}

// Maps diary entry fields → goal fields
export const NUTRIENT_GOAL_MAP = {
  energy_kcal:     'energy_kcal',
  proteins_g:      'proteins_g',
  carbohydrates_g: 'carbohydrates_g',
  fat_g:           'fat_g',
  fiber_g:         'fiber_g',
}

// Keys shown in gauges and charts
export const TRACKED_NUTRIENTS = [
  'energy_kcal',
  'proteins_g',
  'carbohydrates_g',
  'fat_g',
  'fiber_g',
]

export const NUTRISCORE_COLORS = {
  a: '#038141',
  b: '#85bb2f',
  c: '#fecb02',
  d: '#ee8100',
  e: '#e63312',
}