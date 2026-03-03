import { useNavigate, useLocation } from 'react-router-dom'
import { useModuleStore } from '../../store/moduleStore'
import { useDockStore } from '../../store/dockStore'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/**
 * Mobile Dock
 *
 * Layout (5 slots):
 *   [ app ]  [ app ]  [ HOME ]  [ app ]  [ app ]
 *
 * - Home button always in center, always navigates to '/'
 * - Left 2 slots = dockIds[0], dockIds[1]
 * - Right 2 slots = dockIds[2], dockIds[3]
 * - Active module gets accent dot indicator
 * - Haptic feedback on tap (iOS Taptic Engine)
 */

async function haptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // Web / Android fallback — silently ignore
  }
}

export default function Dock() {
  const { modules, openModule, activeTabId } = useModuleStore()
  const { dockIds } = useDockStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const isHome = location.pathname === '/'

  // Build ordered slot list: [left1, left2, HOME, right1, right2]
  const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m]))
  const slots = [
    moduleMap[dockIds[0]],
    moduleMap[dockIds[1]],
    null, // HOME placeholder
    moduleMap[dockIds[2]],
    moduleMap[dockIds[3]],
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

  return (
    <div
      className="relative z-30 w-full"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Glass pill container */}
      <div className="mx-4 mb-3 flex items-center justify-around rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg px-2 py-3">
        {slots.map((mod, idx) => {
          // Center slot = Home
          if (idx === 2) return <HomeButton key="home" isActive={isHome} onPress={handleHome} />

          if (!mod) return <div key={idx} className="w-12 h-12" />

          const isActive = activeTabId === mod.id && !isHome

          return (
            <DockSlot
              key={mod.id}
              mod={mod}
              isActive={isActive}
              onPress={() => handleModule(mod)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DockSlot({ mod, isActive, onPress }) {
  return (
    <button
      onPointerDown={onPress} // faster than onClick on mobile
      className="flex flex-col items-center gap-1 w-14 active:scale-90 transition-transform duration-100"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
        style={{
          backgroundColor: isActive ? mod.color : `${mod.color}22`,
          boxShadow: isActive ? `0 4px 14px ${mod.color}55` : undefined,
        }}
      >
        {mod.icon}
      </div>

      {/* Active dot */}
      <div
        className="w-1 h-1 rounded-full transition-all duration-200"
        style={{ backgroundColor: isActive ? mod.color : 'transparent' }}
      />
    </button>
  )
}

function HomeButton({ isActive, onPress }) {
  return (
    <button
      onPointerDown={onPress}
      className="flex flex-col items-center gap-1 w-14 active:scale-90 transition-transform duration-100"
    >
      {/* Larger home icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(135deg, #6366f122, #8b5cf622)',
          boxShadow: isActive ? '0 4px 18px #6366f166' : undefined,
        }}
      >
        🏠
      </div>
      <div
        className="w-1 h-1 rounded-full transition-all duration-200"
        style={{ backgroundColor: isActive ? '#6366f1' : 'transparent' }}
      />
    </button>
  )
}