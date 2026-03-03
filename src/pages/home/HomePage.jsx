import { useIsMobile } from '../../hooks/useIsMobile'
import HomePageMobile from './HomePageMobile'
import HomePageDesktop from './HomePageDesktop'

export default function HomePage() {
  const isMobile = useIsMobile()
  return isMobile ? <HomePageMobile /> : <HomePageDesktop />
}