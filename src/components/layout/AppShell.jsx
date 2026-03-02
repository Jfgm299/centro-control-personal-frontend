import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { useAuth } from '../../context/AuthContext'
import DotBackground from './DotBackground'
import UserMenu from './UserMenu'
import TabBar from './TabBar'
import Dock from './Dock'
import ModuleContainer from './ModuleContainer'
import LoginPopup from '../auth/LoginPopup'

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
    <>
      <DotBackground />

      {!user && <LoginPopup />}

      <UserMenu />
      <TabBar />
      <ModuleContainer>
        {modulesLoaded ? (
          <Outlet />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {t('status.loading')}
          </div>
        )}
      </ModuleContainer>
      <Dock />
    </>
  )
}