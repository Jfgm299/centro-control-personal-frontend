import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { useAuth } from '../../context/AuthContext'
import { useDragStore } from '../../store/dragStore'
import DotBackground from './DotBackground'
import UserMenu from './UserMenu'
import DockMobile from './DockMobile'
import LoginPopup from '../auth/LoginPopup'

function DragGhost() {
  const { isDragging, draggingModule, ghostX, ghostY, overDock } = useDragStore()
  if (!isDragging || !draggingModule) return null
  return (
    <div className="pointer-events-none fixed" style={{ zIndex: 99999, left: ghostX - 32, top: ghostY - 32 }}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{
          background: `linear-gradient(145deg, ${draggingModule.color}cc, ${draggingModule.color})`,
          boxShadow: `0 8px 32px ${draggingModule.color}88`,
          transform: overDock ? 'scale(0.85)' : 'scale(1.12)',
          transition: 'transform 0.15s ease',
          opacity: 0.96,
        }}
      >
        {draggingModule.icon}
      </div>
    </div>
  )
}

export default function AppShellMobile() {
  const { loadModules, modulesLoaded } = useModuleStore()
  const { t } = useTranslation('common')
  const { user, isLoading } = useAuth()

  useEffect(() => { loadModules() }, [loadModules])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        {t('status.loading')}
      </div>
    )
  }

  return (
    <div
      className="relative w-full bg-transparent flex flex-col"
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
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' }}
      >
        {modulesLoaded ? <Outlet /> : (
          <div className="flex items-center justify-center h-full text-gray-400">
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