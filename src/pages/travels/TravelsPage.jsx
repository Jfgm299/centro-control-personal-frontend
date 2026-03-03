import { useIsMobile } from '../../hooks/useIsMobile'
import TravelsPageMobile from './TravelsPageMobile'
import TravelsPageDesktop from './TravelsPageDesktop'

export default function TravelsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <TravelsPageMobile /> : <TravelsPageDesktop />
}