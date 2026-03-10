import { BarChart2 } from 'lucide-react'
import MacroPage from './MacroPage'

export default {
  id: 'macro_tracker',
  labelKey: 'nav.macro',
  icon: BarChart2,
  iconType: 'lucide',
  path: '/macro',
  color: '#8b5cf6',
  component: MacroPage,
  permanent: false,
  descriptionKey: 'home:modules.macro.description',
}