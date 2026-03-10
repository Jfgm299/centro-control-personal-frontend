import { Zap } from 'lucide-react'
import AutomationsPage from './AutomationsPage'

export default {
  id:             'automations_engine',
  labelKey:       'nav.automations',
  icon:           Zap,
  iconType:       'lucide',
  path:           '/automations',
  color:          '#8b5cf6',
  component:      AutomationsPage,
  permanent:      false,
  descriptionKey: 'home:modules.automations.description',
}