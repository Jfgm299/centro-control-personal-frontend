import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
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
  const navigate = useNavigate()

  useEffect(() => {
    loadModules()
    navigate('/')
  }, [])

  // Espera a que AuthContext compruebe la sesión antes de renderizar
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

      {/* Popup de login — solo visible si no hay sesión */}
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