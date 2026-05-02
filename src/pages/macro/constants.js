import { Apple, Cookie, Moon, Sandwich, Sunrise, UtensilsCrossed } from 'lucide-react'

export const MEAL_TYPES = [
  { key: 'breakfast',       icon: Sunrise,          order: 0 },
  { key: 'morning_snack',   icon: Apple,            order: 1 },
  { key: 'lunch',           icon: UtensilsCrossed,  order: 2 },
  { key: 'afternoon_snack', icon: Sandwich,         order: 3 },
  { key: 'dinner',          icon: Moon,             order: 4 },
  { key: 'other',           icon: Cookie,           order: 5 },
]

export const NUTRIENT_COLORS = {
  energy_kcal:     '#facc15', // amber-400
  proteins_g:      '#38bdf8', // sky-400
  carbohydrates_g: '#2dd4bf', // teal-400
  fat_g:           '#fb7185', // rose-400
    fiber_g:         '#a3e635', // lime-400
}

export const NUTRIENT_GOAL_MAP = {
  energy_kcal:     'energy_kcal',
  proteins_g:      'proteins_g',
  carbohydrates_g: 'carbohydrates_g',
  fat_g:           'fat_g',
  fiber_g:         'fiber_g',
}

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
