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

export default function AppShellDesktop() {
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

  // Background gradient based on time of day
  const hour = new Date().getHours()
  const bgGradient = hour > 5 && hour < 18
    ? 'from-sky-500/30 to-blue-600/30' // Day
    : 'from-slate-900/50 to-indigo-900/50' // Night

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex flex-col`}>
      <DotBackground />
      {!user && <LoginPopup />}
      {user && <UserMenu />}
      <TabBar />
      <ModuleContainer>
        {modulesLoaded ? (
          <Outlet />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50">
            {t('status.loading')}
          </div>
        )}
      </ModuleContainer>
      <Dock />
    </div>
  )
}