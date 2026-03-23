import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useModuleStore } from '../../store/moduleStore'

export default function HomePageDesktop() {
  const { modules, openModule } = useModuleStore()
  const { t } = useTranslation(['home', 'common'])
  const navigate = useNavigate()

  const handleOpen = (module) => {
    openModule(module.id)
    navigate(module.path)
  }

  const filteredModules = modules.filter(m => m.id !== 'home')

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 pb-20 max-w-7xl mx-auto text-white">
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-white">{t('home:welcome.title')}</h1>
        <p className="text-white/60 mt-1">{t('home:welcome.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => (
          <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            key={module.id}
            onClick={() => handleOpen(module)}
            className="group relative overflow-hidden rounded-2xl p-5 text-left backdrop-blur-xl backdrop-saturate-150 bg-white/10 border border-white/20 shadow-lg shadow-black/5 transition-all hover:bg-white/20 hover:border-white/30 hover:shadow-xl"
          >
            {/* Gradiente sutil interno al hacer hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: `${module.color}30` }}
              >
                {typeof module.icon === 'string' ? (
                  <span className="text-3xl">{module.icon}</span>
                ) : (
                  <module.icon
                    size={32}
                    color="white"
                    strokeWidth={2}
                  />
                )}
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-white transition-colors">
                  {t(`common:${module.labelKey}`)}
                </p>
                {module.descriptionKey && (
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                    {t(module.descriptionKey)}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
