import { useIsMobile } from '../../hooks/useIsMobile'
import DockMobile from './DockMobile'
import DockDesktop from './DockDesktop'

export default function Dock() {
  const isMobile = useIsMobile()
  return isMobile ? <DockMobile /> : <DockDesktop />
}