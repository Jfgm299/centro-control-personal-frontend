const MODULE_REGISTRY = {
  home: {
    id: 'home',
    labelKey: 'nav.home',
    icon: '⌂',
    path: '/',
    color: '#f59e0b',
    permanent: true,
  },
  gym_tracker: {
    id: 'gym_tracker',
    labelKey: 'nav.gym',
    icon: '🏋️',
    path: '/gym',
    color: '#6366f1',
    descriptionKey: 'home:modules.gym.description',
  },
  expenses_tracker: {
    id: 'expenses_tracker',
    labelKey: 'nav.expenses',
    icon: '💳',
    path: '/expenses',
    color: '#22c55e',
    descriptionKey: 'home:modules.expenses.description',
  },
  flights_tracker: {
    id: 'flights_tracker',
    labelKey: 'nav.flights',
    icon: '✈️',
    path: '/flights',
    color: '#38bdf8',
    descriptionKey: 'home:modules.flights.description',
  },
  macro_tracker: {
    id: 'macro_tracker',
    labelKey: 'nav.macro',
    icon: '📊',
    path: '/macro',
    color: '#8b5cf6',
    descriptionKey: 'home:modules.macro.description',
  },
  travels_tracker: {
    id: 'travels_tracker',
    labelKey: 'nav.travels',
    icon: '🧳',
    path: '/travels',
    color: '#f472b6',
    descriptionKey: 'home:modules.travels.description',
  },
}

export default MODULE_REGISTRY