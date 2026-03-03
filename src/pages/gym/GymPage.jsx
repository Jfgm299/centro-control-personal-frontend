import { useIsMobile } from '../../hooks/useIsMobile'
import GymPageMobile from './GymPageMobile'
import GymPageDesktop from './GymPageDesktop'

export default function GymPage() {
  const isMobile = useIsMobile()
  return isMobile ? <GymPageMobile /> : <GymPageDesktop />
}