import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { useAutomationsStore } from '../../store/editorStore'
import PanelHeader from './PanelHeader'

/**
 * Draggable, resizable floating panel wrapper component.
 * Used for NodePicker, NDV, and preview panels.
 *
 * @param {Object} props
 * @param {string} props.id - Unique panel identifier (e.g., 'nodePicker', 'ndv')
 * @param {string} props.title - Panel header title
 * @param {React.ReactNode} props.children - Panel content
 * @param {number} [props.defaultWidth=280] - Initial width
 * @param {number} [props.defaultHeight=400] - Initial height
 * @param {number} [props.minWidth=200] - Minimum resize width
 * @param {number} [props.minHeight=150] - Minimum resize height
 * @param {{ x: number, y: number }} [props.defaultPosition] - Initial position
 * @param {boolean} [props.collapsible=true] - Show collapse button
 * @param {boolean} [props.resizable=true] - Allow resize
 * @param {() => void} [props.onClose] - Close button callback
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.headerActions] - Custom header actions
 */
export default function FloatingPanel({
  id,
  title,
  children,
  defaultWidth = 280,
  defaultHeight = 400,
  minWidth = 200,
  minHeight = 150,
  defaultPosition,
  collapsible = true,
  resizable = true,
  onClose,
  className = '',
  headerActions,
}) {
  const containerRef = useRef(null)
  const panelRef = useRef(null)
  const dragControls = useDragControls()

  // Store state
  const panel = useAutomationsStore((s) => s.panels[id])
  const setPanelPosition = useAutomationsStore((s) => s.setPanelPosition)
  const setPanelSize = useAutomationsStore((s) => s.setPanelSize)
  const togglePanelCollapse = useAutomationsStore((s) => s.togglePanelCollapse)
  const closePanel = useAutomationsStore((s) => s.closePanel)
  const bringPanelToFront = useAutomationsStore((s) => s.bringPanelToFront)

  // Local state for resize dragging
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 })

  // Get current position and size from store or defaults
  const position = panel?.position ?? defaultPosition ?? { x: 16, y: 16 }
  const size = panel?.size ?? { w: defaultWidth, h: defaultHeight }
  const collapsed = panel?.collapsed ?? false
  const zIndex = panel?.zIndex ?? 100

  // Find the parent container bounds for drag constraints
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })

  useEffect(() => {
    const updateBounds = () => {
      const parent = panelRef.current?.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        setBounds({
          left: 0,
          top: 0,
          right: rect.width - size.w,
          bottom: rect.height - size.h,
        })
      }
    }
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [size.w, size.h])

  // Handle drag end - save position to store
  const handleDragEnd = useCallback((event, info) => {
    const newX = Math.max(0, Math.min(position.x + info.offset.x, bounds.right))
    const newY = Math.max(0, Math.min(position.y + info.offset.y, bounds.bottom))
    setPanelPosition(id, { x: newX, y: newY })
  }, [id, position, bounds, setPanelPosition])

  // Handle mouse down - bring panel to front
  const handleMouseDown = useCallback(() => {
    bringPanelToFront(id)
  }, [id, bringPanelToFront])

  // Handle resize
  const handleResizeStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.w,
      h: size.h,
    }

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - resizeStartRef.current.x
      const deltaY = moveEvent.clientY - resizeStartRef.current.y
      const parent = panelRef.current?.parentElement
      const parentRect = parent?.getBoundingClientRect()

      let newWidth = Math.max(minWidth, resizeStartRef.current.w + deltaX)
      let newHeight = Math.max(minHeight, resizeStartRef.current.h + deltaY)

      // Constrain to parent bounds
      if (parentRect) {
        const maxWidth = parentRect.width - position.x - 16
        const maxHeight = parentRect.height - position.y - 16
        newWidth = Math.min(newWidth, maxWidth)
        newHeight = Math.min(newHeight, maxHeight)
      }

      setPanelSize(id, { w: newWidth, h: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [id, size, minWidth, minHeight, position, setPanelSize])

  // Handle close
  const handleClose = useCallback(() => {
    closePanel(id)
    onClose?.()
  }, [id, closePanel, onClose])

  // Handle collapse
  const handleCollapse = useCallback(() => {
    togglePanelCollapse(id)
  }, [id, togglePanelCollapse])

  // Start drag from header
  const startDrag = useCallback((e) => {
    dragControls.start(e)
  }, [dragControls])

  return (
    <motion.div
      ref={panelRef}
      className={`floating-panel glass-panel ${collapsed ? 'floating-panel--collapsed' : ''} ${className}`}
      style={{
        width: size.w,
        height: collapsed ? 'auto' : size.h,
        zIndex,
        x: position.x,
        y: position.y,
      }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={bounds}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {/* Header - serves as drag handle */}
      <div onPointerDown={startDrag}>
        <PanelHeader
          title={title}
          collapsed={collapsed}
          collapsible={collapsible}
          onCollapse={handleCollapse}
          onClose={handleClose}
        >
          {headerActions}
        </PanelHeader>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="panel-body">
          {children}
        </div>
      )}

      {/* Resize handle */}
      {resizable && !collapsed && (
        <div
          className="panel-resize-handle"
          onMouseDown={handleResizeStart}
        />
      )}
    </motion.div>
  )
}
