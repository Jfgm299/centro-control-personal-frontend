import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useModuleStore } from '../../store/moduleStore'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const SPRING = { type: 'spring', stiffness: 400, damping: 35 }

export default function TabBar() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useModuleStore()
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  const containerRef  = useRef(null)
  const naturalWidthRef = useRef(0)    // last measured full-width scrollWidth
  const prevLengthRef   = useRef(openTabs.length)
  const [compact, setCompact] = useState(false)
  const [, setTick]   = useState(0)    // force re-render on container resize

  // Overflow detection — runs after every render (before paint)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const tabsDecreased = openTabs.length < prevLengthRef.current
    prevLengthRef.current = openTabs.length

    if (!compact) {
      // Not compact: measure natural width and decide
      naturalWidthRef.current = el.scrollWidth
      if (el.scrollWidth > el.clientWidth) setCompact(true)
    } else {
      if (tabsDecreased) {
        // Tab was removed: switch to non-compact so next render measures fresh natural width
        setCompact(false)
      } else if (naturalWidthRef.current <= el.clientWidth) {
        // Container grew enough to fit all tabs at full width
        setCompact(false)
      }
    }
  })

  // Re-render when container resizes (window resize, sidebar toggle, etc.)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setTick(n => n + 1))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
      if (remaining.length > 0) navigate(remaining[0].path)
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 pointer-events-none overflow-hidden"
      style={{ height: '64px' }}
    >
      <LayoutGroup>
      {openTabs.map((tab) => {
        const isActive  = activeTabId === tab.id
        const showFull  = !compact || isActive

        return (
          <motion.div
            key={tab.id}
            layout
            transition={SPRING}
            className="relative pointer-events-auto flex-shrink-0 overflow-hidden"
          >
            <button
              onClick={() => handleTabClick(tab)}
              className={clsx(
                'relative flex items-center gap-2 py-2 text-sm font-semibold',
                'transition-colors duration-200 select-none rounded-lg',
                showFull ? 'pl-3 pr-2' : 'px-2',
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

              {/* Module color stripe */}
              <div
                className="relative flex-shrink-0 w-1 h-4 rounded-full"
                style={{ backgroundColor: tab.color ?? 'rgb(255 255 255 / 0.5)' }}
              />

              {/* Icon */}
              <span className="relative z-10 flex-shrink-0">
                {tab.iconType === 'emoji' ? (
                  <span className="text-base leading-none">{tab.icon}</span>
                ) : (
                  <tab.icon size={20} color="#FFF" strokeWidth={2.2} />
                )}
              </span>

              {/* Label — only opacity fade on exit, no width animation */}
              <AnimatePresence initial={false}>
                {showFull && (
                  <motion.span
                    key="label"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {t(tab.labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Close button — only opacity fade on exit */}
              <AnimatePresence initial={false}>
                {showFull && !tab.permanent && (
                  <motion.span
                    key="close"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.08 }}
                    onClick={(e) => handleClose(e, tab.id)}
                    className={clsx(
                      'relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs',
                      'hover:bg-black/20 transition-colors cursor-pointer',
                      isActive ? 'text-white/70' : 'text-white/40',
                    )}
                  >
                    ✕
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )
      })}
      </LayoutGroup>
    </div>
  )
}
