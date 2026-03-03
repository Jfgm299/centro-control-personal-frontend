import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { useAuth } from '../../context/AuthContext'
import DotBackground from './DotBackground'
import UserMenu from './UserMenu'
import Dock from './DockMobile'
import LoginPopup from '../auth/LoginPopup'

/**
 * Mobile AppShell
 *
 * Layout:
 *   ┌─────────────────────┐  ← safe-area-inset-top (status bar iOS)
 *   │  UserMenu (top-right)│
 *   ├─────────────────────┤
 *   │                     │
 *   │   <Outlet />        │  ← scrollable content area
 *   │                     │
 *   ├─────────────────────┤
 *   │   Dock (5 icons)    │
 *   └─────────────────────┘  ← safe-area-inset-bottom (home indicator iOS)
 *
 * TabBar removed — navigation is handled by the Dock on mobile.
 * ModuleContainer removed — pages manage their own scroll.
 */
export default function AppShell() {
  const { loadModules, modulesLoaded } = useModuleStore()
  const { t } = useTranslation('common')
  const { user, isLoading } = useAuth()

  useEffect(() => {
    loadModules()
  }, [loadModules])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        {t('status.loading')}
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col w-full overflow-hidden bg-transparent"
      style={{ height: '100dvh' }} // dvh respeta la barra de dirección en Safari mobile
    >
      <DotBackground />

      {!user && <LoginPopup />}

      {/* Status bar spacer — respeta la notch/dynamic island en iOS */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      {/* Top-right user menu */}
      <div className="relative z-20 flex justify-end px-4 pt-2">
        <UserMenu />
      </div>

      {/* Main content — scrollable, takes all available space */}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        {modulesLoaded ? (
          <Outlet />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {t('status.loading')}
          </div>
        )}
      </main>

      {/* Dock — fixed at bottom with safe area */}
      <Dock />
    </div>
  )
}