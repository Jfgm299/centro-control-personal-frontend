import { useIsMobile } from '../../hooks/useIsMobile'
import AppShellMobile from './AppShellMobile'
import AppShellDesktop from './AppShellDesktop'

export default function AppShell() {
  const isMobile = useIsMobile()
  return isMobile ? <AppShellMobile /> : <AppShellDesktop />
}