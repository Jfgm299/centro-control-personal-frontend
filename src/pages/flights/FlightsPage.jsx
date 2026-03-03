import { useIsMobile } from '../../hooks/useIsMobile'
import FlightsPageMobile from './FlightsPageMobile'
import FlightsPageDesktop from './FlightsPageDesktop'

export default function FlightsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <FlightsPageMobile /> : <FlightsPageDesktop />
}