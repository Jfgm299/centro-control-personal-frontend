import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { useAuth } from '../../context/AuthContext'
import { useDragStore } from '../../store/dragStore'
import { hexToRgba } from '../../lib/colorUtils'
import DotBackground from './DotBackground'
import UserMenu from './UserMenu'
import DockMobile from './DockMobile'
import LoginPopup from '../auth/LoginPopup'

function DragGhost() {
  // ... (código existente de DragGhost sin cambios)
}

export default function AppShellMobile() {
  const { loadModules, modulesLoaded } = useModuleStore()
  const { t } = useTranslation('common')
  const { user, isLoading } = useAuth()
  const location = useLocation()

  const mainRef = useRef(null)

  useEffect(() => { loadModules() }, [loadModules])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [location.pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        {t('status.loading')}
      </div>
    )
  }

  return (
    <div
      className="relative w-full flex flex-col bg-gradient-to-br from-slate-900/50 to-indigo-900/50"
      style={{
        height: '100vh',
        maxHeight: '-webkit-fill-available',
        overflow: 'hidden',
      }}
    >
      <DotBackground />
      {!user && <LoginPopup />}

      {/* Safe area top + UserMenu */}
      <div className="relative z-20 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex justify-end px-4 pt-2">
          <UserMenu />
        </div>
      </div>

      {/* Main content — pb para que el contenido no quede tapado por el dock flotante */}
      <main
        ref={mainRef}
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{ paddingBottom: `calc(90px + env(safe-area-inset-bottom))` }}
      >
        {modulesLoaded ? <Outlet /> : (
          <div className="flex items-center justify-center h-full text-white/50">
            {t('status.loading')}
          </div>
        )}
      </main>

      {/* Dock flotante — fixed sobre el contenido, no reserva espacio */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <DockMobile />
      </div>

      <DragGhost />
    </div>
  )
}
