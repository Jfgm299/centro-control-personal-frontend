import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useModuleStore } from '../../store/moduleStore'
import { useDockStore } from '../../store/dockStore'
import { useDragStore } from '../../store/dragStore'
import { useHomeStore } from '../../store/homeStore'

const LONG_PRESS_MS = 500

async function haptic(style = ImpactStyle.Medium) {
  try { await Haptics.impact({ style }) } catch {}
}

export default function HomePageMobile() {
  const { t } = useTranslation(['home', 'common'])
  const { modules, openModule } = useModuleStore()
  const { addToDock, isFull, dockIds } = useDockStore()
  const { isDragging, draggingModule, ghostX, ghostY, overDock,
          startDrag, updateGhost, endDrag } = useDragStore()
  const { order, initOrder, moveModule } = useHomeStore()
  const navigate = useNavigate()

  const gridRef       = useRef(null)
  const [dragFromIdx, setDragFromIdx] = useState(null)
  const [hoverIdx, setHoverIdx]       = useState(null)

  const appModules = modules.filter((m) => m.id !== 'home')

  useEffect(() => {
    initOrder(appModules.map((m) => m.id))
  }, []) // eslint-disable-line

  const moduleMap = Object.fromEntries(appModules.map((m) => [m.id, m]))
  const orderedModules = order
    .map((id) => moduleMap[id])
    .filter(Boolean)
    .concat(appModules.filter((m) => !order.includes(m.id)))

  const getHoverIndex = useCallback((x, y) => {
    if (!gridRef.current) return null
    const cells = gridRef.current.querySelectorAll('[data-cell]')
    let closest = null
    let minDist  = Infinity
    cells.forEach((cell, i) => {
      const rect = cell.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top  + rect.height / 2
      const d  = Math.hypot(x - cx, y - cy)
      if (d < minDist) { minDist = d; closest = i }
    })
    return closest
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0
      updateGhost(x, y)
      if (dragFromIdx !== null) setHoverIdx(getHoverIndex(x, y))
    }

    const onUp = async (e) => {
      const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0
      const y = e.clientY ?? e.changedTouches?.[0]?.clientY ?? 0
      updateGhost(x, y)

      const store = useDragStore.getState()

      if (store.overDock && draggingModule) {
        const added = addToDock(draggingModule.id)
        await haptic(added ? ImpactStyle.Heavy : ImpactStyle.Light)
      } else if (dragFromIdx !== null) {
        const toIdx = getHoverIndex(x, y)
        if (toIdx !== null && toIdx !== dragFromIdx) {
          moveModule(dragFromIdx, toIdx)
          await haptic(ImpactStyle.Light)
        }
      }

      setDragFromIdx(null)
      setHoverIdx(null)
      endDrag()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
    }
  }, [isDragging, draggingModule, dragFromIdx, updateGhost, endDrag,
      addToDock, moveModule, getHoverIndex])

  const handleOpen = async (module) => {
    await haptic()
    openModule(module.id)
    navigate(module.path)
  }

  const displayModules = [...orderedModules]
  if (isDragging && dragFromIdx !== null && hoverIdx !== null && hoverIdx !== dragFromIdx) {
    const [item] = displayModules.splice(dragFromIdx, 1)
    displayModules.splice(hoverIdx, 0, item)
  }

  return (
    <div className="flex flex-col min-h-full px-4 pt-4 pb-8 select-none">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('home:welcome.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('home:welcome.subtitle')}</p>
      </div>

      {/* App grid */}
      <div ref={gridRef} className="grid grid-cols-4 gap-x-4 gap-y-6">
        {displayModules.map((module, idx) => {
          const originalIdx     = orderedModules.indexOf(module)
          const isDraggingThis  = isDragging && draggingModule?.id === module.id
          const isInsertTarget  = isDragging && hoverIdx === idx && dragFromIdx !== idx

          return (
            <AppIcon
              key={module.id}
              module={module}
              label={t(`common:${module.labelKey}`, module.label)}
              inDock={dockIds.includes(module.id)}
              isDraggingThis={isDraggingThis}
              isInsertTarget={isInsertTarget}
              onTap={() => !isDragging && handleOpen(module)}
              onLongPress={(x, y) => {
                setDragFromIdx(originalIdx)
                startDrag(module, x, y)
                haptic(ImpactStyle.Heavy)
              }}
            />
          )
        })}
      </div>

      {!isFull() && (
        <p className="text-center text-xs text-gray-400 mt-8">
          {t('common:dock.hint')}
        </p>
      )}

      {/* Dock full toast */}
      {isDragging && isFull() && overDock && (
        <div
          className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full pointer-events-none"
          style={{ zIndex: 99999 }}
        >
          {t('common:dock.full')}
        </div>
      )}
    </div>
  )
}

function AppIcon({ module, label, inDock, isDraggingThis, isInsertTarget, onTap, onLongPress }) {
  const timerRef = useRef(null)
  const startPos = useRef(null)
  const didDrag  = useRef(false)

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    didDrag.current  = false
    startPos.current = { x: e.clientX, y: e.clientY }
    timerRef.current = setTimeout(() => {
      onLongPress(e.clientX, e.clientY)
    }, LONG_PRESS_MS)
  }, [onLongPress])

  const handlePointerMove = useCallback((e) => {
    if (!startPos.current) return
    const dx = Math.abs(e.clientX - startPos.current.x)
    const dy = Math.abs(e.clientY - startPos.current.y)
    if (dx > 6 || dy > 6) { clearTimeout(timerRef.current); didDrag.current = true }
  }, [])

  const handlePointerUp = useCallback(() => {
    clearTimeout(timerRef.current)
    if (!didDrag.current) onTap()
    didDrag.current  = false
    startPos.current = null
  }, [onTap])

  return (
    <div
      data-cell
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      style={{
        opacity:   isDraggingThis ? 0.25 : 1,
        transform: isInsertTarget ? 'scale(0.92)' : 'scale(1)',
        transition: 'opacity 0.2s, transform 0.15s',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => clearTimeout(timerRef.current)}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md relative"
        style={{
          background: `linear-gradient(145deg, ${module.color}cc, ${module.color})`,
          boxShadow: isInsertTarget
            ? `0 0 0 3px white, 0 0 0 5px ${module.color}`
            : `0 4px 14px ${module.color}44`,
        }}
      >
        {module.iconType === 'image' ? (
              <div className="w-full h-full overflow-hidden rounded-[inherit]">
                <img src={module.icon} alt="icon" className="w-full h-full object-cover pointer-events-none drop-shadow-sm" />
              </div>
            ) : (
              module.icon
            )}
        {inDock && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white border border-gray-200 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>
        )}
      </div>
      <span className="text-xs text-gray-700 font-medium leading-tight text-center line-clamp-1 w-full">
        {label}
      </span>
    </div>
  )
}