import { motion } from 'framer-motion'
import { useModuleStore } from '../../store/moduleStore'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export default function TabBar() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useModuleStore()
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  if (openTabs.length === 0) return null

  const handleTabClick = (tab) => {
    setActiveTab(tab.id)
    navigate(tab.path)
  }

  const handleClose = (e, tabId) => {
    e.stopPropagation()
    closeTab(tabId)
    const { openTabs: currentTabs, activeTabId: currentActive } = useModuleStore.getState()
    if (currentActive === tabId) {
      const remaining = currentTabs.filter(t => t.id !== tabId)
      if (remaining.length > 0) {
        navigate(remaining[0].path)
      }
    }
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 pointer-events-none overflow-x-auto no-scrollbar"
      style={{ height: '64px' }}
    >
      {openTabs.map((tab) => {
        const isActive = activeTabId === tab.id

        return (
          <div
            key={tab.id}
            className="relative pointer-events-auto flex-shrink-0"
          >
            <button
              onClick={() => handleTabClick(tab)}
              className={clsx(
                'relative flex items-center gap-2 pl-3 pr-4 py-2 text-sm font-semibold',
                'transition-colors duration-200 select-none rounded-lg',
                isActive
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-black/10',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator-main"
                  className="absolute inset-0 bg-white/5 rounded-lg shadow-md backdrop-blur-sm"
                />
              )}

              {/* Module Color Indicator */}
              <div
                className="relative w-1 h-4 rounded-full"
                style={{ backgroundColor: tab.color ?? 'rgb(255 255 255 / 0.5)' }}
              />

              <span className="relative z-10 flex items-center gap-2">
                {tab.iconType === 'emoji' ? (
                  <span className="text-base">{tab.icon}</span>
                ) : (
                  <tab.icon
                    size={20}
                    // Color del icono es blanco, la barra lateral ya da el color del módulo
                    color={'#FFF'}
                    strokeWidth={2.2}
                  />
                )}
                <span>{t(tab.labelKey)}</span>

                {!tab.permanent && (
                  <span
                    onClick={(e) => handleClose(e, tab.id)}
                    className={clsx(
                      'ml-1 w-5 h-5 rounded-full flex items-center justify-center text-xs',
                      'hover:bg-black/20 transition-colors',
                      isActive ? 'text-white/70' : 'text-white/40',
                    )}
                  >
                    ✕
                  </span>
                )}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
