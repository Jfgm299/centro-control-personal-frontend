import { BarChart2 } from 'lucide-react'
import MacroPage from './MacroPage'

export default {
  id: 'macro_tracker',
  labelKey: 'nav.macro',
  icon: BarChart2,
  iconType: 'lucide',
  path: '/macro',
    color: '#4ade80',
  component: MacroPage,
  permanent: false,
  descriptionKey: 'home:modules.macro.description',
}