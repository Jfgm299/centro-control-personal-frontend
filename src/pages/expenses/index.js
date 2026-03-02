import ExpensesPage from './ExpensesPage'

export default {
  id: 'expenses_tracker',
  labelKey: 'nav.expenses',
  icon: '💳',
  path: '/expenses',
  color: '#22c55e',
  component: ExpensesPage,
  permanent: false,
  descriptionKey: 'home:modules.expenses.description',
}