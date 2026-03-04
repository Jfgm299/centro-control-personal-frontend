import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { useDockStore } from '../../store/dockStore'
import { useDragStore, setDockBounds } from '../../store/dragStore'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const LONG_PRESS_MS = 500

async function haptic(style = ImpactStyle.Light) {
  try { await Haptics.impact({ style }) } catch {}
}

export default function DockMobile() {
  const { t } = useTranslation('common')
  const { modules, openModule, activeTabId } = useModuleStore()
  const { dockIds, isFull, removeFromDock }  = useDockStore()
  const { isDragging, overDock }             = useDragStore()
  const navigate   = useNavigate()
  const location   = useLocation()
  const dockRef    = useRef(null)

  const isHome = location.pathname === '/'

  useEffect(() => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect()
      setDockBounds({
        left:   rect.left,
        right:  rect.right,
        top:    isDragging ? rect.top - 48 : rect.top,
        bottom: rect.bottom,
      })
    }
  })

  const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m]))
  const slots = [
    moduleMap[dockIds[0]] ?? null,
    moduleMap[dockIds[1]] ?? null,
    null,
    moduleMap[dockIds[2]] ?? null,
    moduleMap[dockIds[3]] ?? null,
  ]

  const handleModule = async (mod) => {
    if (!mod) return
    await haptic()
    openModule(mod.id)
    navigate(mod.path)
  }

  const handleHome = async () => {
    await haptic()
    navigate('/')
  }

  const dockExpanded = isDragging && overDock
  const showReject   = dockExpanded && isFull()

  return (
    <div className="relative z-30 w-full">
      <div
        ref={dockRef}
        className="mx-4 mt-2 mb-2 flex items-center justify-around rounded-3xl px-2 border transition-all duration-200"
        style={{
          paddingTop:    dockExpanded ? '16px' : '12px',
          paddingBottom: dockExpanded ? '16px' : '12px',
          background: dockExpanded
            ? showReject ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)'
            : 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: dockExpanded
            ? showReject ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.5)'
            : 'rgba(255,255,255,0.80)',
          boxShadow: dockExpanded
            ? showReject ? '0 0 0 2px rgba(239,68,68,0.25)' : '0 0 0 2px rgba(99,102,241,0.25)'
            : '0 4px 24px rgba(0,0,0,0.10)',
        }}
      >
        {slots.map((mod, idx) => {
          if (idx === 2) return <HomeButton key="home" isActive={isHome} onPress={handleHome} />
          if (!mod) return (
            <div key={`empty-${idx}`} className="w-14 h-14 flex items-center justify-center">
              {isDragging && !isFull() && (
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-indigo-400/60 flex items-center justify-center">
                  <span className="text-indigo-400 text-xl">+</span>
                </div>
              )}
            </div>
          )
          const isActive = activeTabId === mod.id && !isHome
          return (
            <DockSlot
              key={mod.id}
              mod={mod}
              isActive={isActive}
              removeLabel={t('dock.removeConfirm')}
              onPress={() => handleModule(mod)}
              onRemove={() => { removeFromDock(mod.id); haptic(ImpactStyle.Medium) }}
            />
          )
        })}
      </div>

      {dockExpanded && !showReject && (
        <p className="text-center text-xs text-indigo-500 font-medium -mt-1 mb-1 pointer-events-none">
          {t('dock.dropHint')}
        </p>
      )}
      {showReject && (
        <p className="text-center text-xs text-red-500 font-medium -mt-1 mb-1 pointer-events-none">
          {t('dock.full')}
        </p>
      )}
    </div>
  )
}

function DockSlot({ mod, isActive, removeLabel, onPress, onRemove }) {
  const [showRemove, setShowRemove] = useState(false)
  const timerRef = useRef(null)
  const didMove  = useRef(false)

  const handlePointerDown = () => {
    didMove.current = false
    timerRef.current = setTimeout(() => {
      if (!didMove.current) { setShowRemove(true); haptic(ImpactStyle.Heavy) }
    }, LONG_PRESS_MS)
  }
  const handlePointerMove = () => { didMove.current = true; clearTimeout(timerRef.current) }
  const handlePointerUp = () => {
    clearTimeout(timerRef.current)
    if (!didMove.current && !showRemove) onPress()
    didMove.current = false
  }

  useEffect(() => {
    if (!showRemove) return
    const dismiss = () => setShowRemove(false)
    setTimeout(() => window.addEventListener('pointerdown', dismiss), 50)
    return () => window.removeEventListener('pointerdown', dismiss)
  }, [showRemove])

  return (
    <div className="relative flex flex-col items-center gap-1 w-14">
      {showRemove && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
          onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => { onRemove(); setShowRemove(false) }}
            className="flex items-center gap-1.5 bg-white border border-red-200 shadow-lg rounded-xl px-3 py-1.5 text-xs font-semibold text-red-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {removeLabel}
          </button>
          <div className="w-2 h-2 bg-white border-r border-b border-red-200 rotate-45 mx-auto -mt-1" />
        </div>
      )}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => clearTimeout(timerRef.current)}
        className="flex flex-col items-center gap-1 w-14 active:scale-90 transition-transform duration-100"
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
          style={{
            backgroundColor: isActive ? mod.color : `${mod.color}22`,
            boxShadow: isActive ? `0 4px 14px ${mod.color}55` : undefined,
            outline: showRemove ? '2px solid rgba(239,68,68,0.6)' : 'none',
          }}>
          {mod.icon}
        </div>
        <div className="w-1 h-1 rounded-full"
          style={{ backgroundColor: isActive ? mod.color : 'transparent' }} />
      </button>
    </div>
  )
}

function HomeButton({ isActive, onPress }) {
  return (
    <button onPointerDown={onPress}
      className="flex flex-col items-center gap-1 w-14 active:scale-90 transition-transform duration-100">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(135deg, #6366f122, #8b5cf622)',
          boxShadow: isActive ? '0 4px 18px #6366f166' : undefined,
        }}>
        🏠
      </div>
      <div className="w-1 h-1 rounded-full"
        style={{ backgroundColor: isActive ? '#6366f1' : 'transparent' }} />
    </button>
  )
}