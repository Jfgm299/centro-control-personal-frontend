import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { useAuth } from '../../context/AuthContext'
import DotBackground from './DotBackground'
import UserMenu from './UserMenu'
import DockMobile from './DockMobile'
import LoginPopup from '../auth/LoginPopup'

export default function AppShellMobile() {
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
    <div className="relative w-full bg-transparent" style={{ height: '100dvh' }}>
      <DotBackground />

      {!user && <LoginPopup />}

      {/* Status bar spacer */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      {/* Top-right user menu */}
      <div className="relative z-20 flex justify-end px-4 pt-2">
        <UserMenu />
      </div>

      {/* Main content — scrollable, ocupa todo el alto */}
      <main
        className="relative z-10 overflow-y-auto overflow-x-hidden"
        style={{
          height: 'calc(100dvh - env(safe-area-inset-top) - 48px)',
        }}
      >
        {modulesLoaded ? (
          <Outlet />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {t('status.loading')}
          </div>
        )}
      </main>

      {/* Dock flotante — fixed, no ocupa espacio en el layout */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <DockMobile />
      </div>
    </div>
  )
}