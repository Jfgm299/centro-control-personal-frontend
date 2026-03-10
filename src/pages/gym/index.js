import { Dumbbell } from 'lucide-react'
import GymPage from './GymPage'

export default {
  id: 'gym_tracker',
  labelKey: 'nav.gym',
  icon: Dumbbell,
  iconType: 'lucide',
  path: '/gym',
  color: '#6366f1',
  component: GymPage,
  permanent: false,
  descriptionKey: 'home:modules.gym.description',
}