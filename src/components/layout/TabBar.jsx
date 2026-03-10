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
    const { openTabs, activeTabId } = useModuleStore.getState()
    closeTab(tabId)
    if (activeTabId === tabId) {
      const remaining = openTabs.filter(t => t.id !== tabId)
      if (remaining.length > 0) {
        const idx = openTabs.findIndex(t => t.id === tabId)
        const next = remaining[idx - 1] || remaining[0]
        navigate(next.path)
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
            style={{ zIndex: isActive ? 10 : 5 }}
          >
            <button
              onClick={() => handleTabClick(tab)}
              className={clsx(
                'relative flex items-center gap-2 px-4 py-2 text-sm font-medium',
                'transition-all duration-150 select-none rounded-xl border',
                isActive
                  ? 'text-gray-800 border-white/80 shadow-sm'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/40',
              )}
              style={isActive ? {
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
              } : {}}
            >
              {tab.iconType === 'emoji' ? (
                <span className="text-base">{tab.icon}</span>
              ) : (
                <tab.icon
                  size={20} // Adjust size as needed for tabs
                  color={isActive ? tab.color : 'rgb(100 116 139)'} // Use tab.color for active state
                  strokeWidth={2.2} // Adjust stroke width for visual weight
                />
              )}
              <span>{t(tab.labelKey)}</span>

              {!tab.permanent && (
                <span
                  onClick={(e) => handleClose(e, tab.id)}
                  className={clsx(
                    'ml-1 w-5 h-5 rounded-full flex items-center justify-center text-xs',
                    'hover:bg-black/10 transition-colors',
                    isActive ? 'text-gray-400' : 'text-gray-300',
                  )}
                >
                  ✕
                </span>
              )}
              
              {isActive && (
                <span
                  className="absolute bottom-1.5 left-4 right-4 h-0.5 rounded-full"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
