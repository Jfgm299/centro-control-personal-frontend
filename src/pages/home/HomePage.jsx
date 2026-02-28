import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModuleStore } from '../../store/moduleStore'

export default function HomePage() {
  const { modules, openModule } = useModuleStore()
  const { t } = useTranslation(['home', 'common'])
  const navigate = useNavigate()

  const handleOpen = (module) => {
    openModule(module.id)
    navigate(module.path)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t('home:welcome.title')}</h1>
        <p className="text-gray-400 mt-1">{t('home:welcome.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleOpen(module)}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/60 bg-white/50 hover:bg-white/80 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${module.color}18` }}
            >
              {module.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-gray-900">
                {t(`common:${module.labelKey}`)}
              </p>
              {module.descriptionKey && (
                <p className="text-sm text-gray-400">{t(module.descriptionKey)}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}