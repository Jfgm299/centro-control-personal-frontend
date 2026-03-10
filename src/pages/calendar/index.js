import { CalendarDays } from 'lucide-react'
import CalendarPage from './CalendarPage'

export default {
  id:             'calendar_tracker',
  labelKey:       'nav.calendar',
  icon:           CalendarDays,
  iconType:       'lucide',
  path:           '/calendar',
  color:          '#6366f1',
  component:      CalendarPage,
  permanent:      false,
  descriptionKey: 'home:modules.calendar.description',
}