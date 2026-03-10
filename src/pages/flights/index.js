import { Plane } from 'lucide-react'
import FlightsPage from './FlightsPage'

export default {
  id: 'flights_tracker',
  labelKey: 'nav.flights',
  icon: Plane,
  iconType: 'lucide',
  path: '/flights',
  color: '#38bdf8',
  component: FlightsPage,
  permanent: false,
  descriptionKey: 'home:modules.flights.description',
}