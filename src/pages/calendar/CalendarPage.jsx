import { useIsMobile } from '../../hooks/useIsMobile'
import CalendarPageMobile  from './CalendarPageMobile'
import CalendarPageDesktop from './CalendarPageDesktop'

export default function CalendarPage() {
  const isMobile = useIsMobile()
  return isMobile ? <CalendarPageMobile /> : <CalendarPageDesktop />
}