import { CreditCard } from 'lucide-react'
import ExpensesPage from './ExpensesPage'

export default {
  id: 'expenses_tracker',
  labelKey: 'nav.expenses',
  icon: CreditCard,
  iconType: 'lucide',
  path: '/expenses',
  color: '#22c55e',
  component: ExpensesPage,
  permanent: false,
  descriptionKey: 'home:modules.expenses.description',
}