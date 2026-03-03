import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/**
 * HomePage — iOS-style app launcher
 *
 * Grid of 4 columns. Each module = rounded icon + label below.
 * Adding a new module to moduleStore makes it appear here automatically.
 * No changes needed in this file when adding modules.
 */

async function haptic() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch { /* web fallback */ }
}

export default function HomePage() {
  const { modules, openModule } = useModuleStore()
  const { t } = useTranslation(['home', 'common'])
  const navigate = useNavigate()

  const handleOpen = async (module) => {
    await haptic()
    openModule(module.id)
    navigate(module.path)
  }

  // Filter out 'home' itself if it's in the modules list
  const appModules = modules.filter((m) => m.id !== 'home')

  return (
    <div className="flex flex-col min-h-full px-4 pt-4 pb-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('home:welcome.title')}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {t('home:welcome.subtitle')}
        </p>
      </div>

      {/* App grid — 4 columns, exactly like iPhone */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-6">
        {appModules.map((module) => (
          <AppIcon
            key={module.id}
            module={module}
            label={t(`common:${module.labelKey}`)}
            onPress={() => handleOpen(module)}
          />
        ))}
      </div>
    </div>
  )
}

// ── AppIcon ───────────────────────────────────────────────────────────────────

function AppIcon({ module, label, onPress }) {
  return (
    <button
      onPointerDown={onPress}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-100"
    >
      {/* Icon square */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
        style={{
          background: `linear-gradient(145deg, ${module.color}cc, ${module.color})`,
          boxShadow: `0 4px 14px ${module.color}44`,
        }}
      >
        {module.icon}
      </div>

      {/* Label */}
      <span className="text-xs text-gray-700 font-medium leading-tight text-center line-clamp-1 w-full">
        {label}
      </span>
    </button>
  )
}