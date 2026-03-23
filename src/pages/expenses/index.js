import { CreditCard } from 'lucide-react'
import ExpensesPage from './ExpensesPage'

export default {
  id: 'expenses_tracker',
  labelKey: 'nav.expenses',
  icon: CreditCard,
  iconType: 'lucide',
  path: '/expenses',
    color: '#f472b6',
  component: ExpensesPage,
  permanent: false,
  descriptionKey: 'home:modules.expenses.description',
}