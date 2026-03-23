import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValueEvent, useMotionValue } from 'framer-motion'

const BASE_SIZE = 52    // px — base icon size
const MAX_SIZE  = 66    // px — subtle zoom, both axes
const DISTANCE  = 100   // px — radius of influence

const SPRING = {
  mass:      0.1,
  stiffness: 200,
  damping:   15,
}

export default function DockIcon({
  module,
  mouseX,
  isActive,
  isOpen,
  isBouncing,
  onClick,
}) {
  // ref goes on the WRAPPER (fixed width) so distance is stable
  const wrapperRef = useRef(null)
  const [tip, setTip] = useState(false)
  const [lucideIconSize, setLucideIconSize] = useState(BASE_SIZE * 0.52)

  // Distance from mouse to icon center in px
  const distance = useTransform(mouseX, (val) => {
    const el = wrapperRef.current
    if (!el) return Infinity
    const { left, width } = el.getBoundingClientRect()
    return val - left - width / 2
  })

  // Map distance → icon size (not scale — so width never changes)
  const sizeSync = useTransform(
    distance,
    [-DISTANCE, 0, DISTANCE],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE],
    { clamp: true }
  )

  const springValue = useMotionValue(BASE_SIZE)
  const size = useSpring(springValue, SPRING)

  useMotionValueEvent(sizeSync, "change", (latest) => {
    springValue.set(latest)
  })

  const radius = useTransform(size, (s) => s * 0.225)
  const font   = useTransform(size, (s) => s * 0.52)

  useMotionValueEvent(font, "change", (latest) => {
    setLucideIconSize(latest)
  })

  return (
    <div
      ref={wrapperRef}
      className="dock-item"
    >

      {/* Icon — only height/fontSize animate, width stays at BASE_SIZE via CSS */}
      <motion.button
        className={`dock-icon${isBouncing ? ' dock-icon--bounce' : ''}`}
        onClick={onClick}
        aria-label={module.label}
        whileTap={{ scale: 0.9 }}
        initial={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: BASE_SIZE * 0.225,
          fontSize: BASE_SIZE * 0.52,
        }}
        style={{
          width:        size,
          height:       size,
          borderRadius: radius,
          fontSize:     font, // Only for emojis - Lucide handles its own size
          ...(isActive && {
            background: `linear-gradient(148deg, ${module.color}dd 0%, ${module.color}88 100%)`,
            boxShadow: [
              `0 6px 20px ${module.color}44`,
              `0 2px 6px rgba(0,0,0,0.15)`,
              `inset 0 1px 0 rgba(255,255,255,0.55)`,
            ].join(', '),
          }),
        }}
      >
        {typeof module.icon === 'string' ? (
          <span className="dock-icon-emoji" style={{ fontSize: font }}>{module.icon}</span>
        ) : (
          <module.icon
            size={lucideIconSize}
            color={isActive ? module.color : 'rgb(100 116 139)'}
            strokeWidth={2.2} // Adjust stroke width for visual weight
            style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18))' }}
          />
        )}
      </motion.button>

      {/* Open-app dot */}
      <div className="dock-dot-track">
        {isOpen && (
          <motion.div
            className="dock-dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              background: isActive ? module.color : 'rgba(0,0,0,0.32)',
              width:  isActive ? 5 : 4,
              height: isActive ? 5 : 4,
            }}
          />
        )}
      </div>
    </div>
  )
}