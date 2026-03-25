import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import DiaryView from './components/diary/DiaryView'

import StatsView from './components/stats/StatsView'
import { useAuth } from '../../context/AuthContext'

const TABS = ['diary', 'stats']

export default function MacroPage() {
  const { t } = useTranslation('macro')
  const { user } = useAuth()

  const today = new Date().toISOString().split('T')[0]
  const [activeTab, setActiveTab] = useState('diary')
  const [date, setDate] = useState(today)

  return (
    <div className="min-h-full text-white">
      <div className="p-4 md:p-6 pb-20 max-w-3xl mx-auto space-y-4">

        <header className="pt-4">
          <h1 className="text-3xl font-bold text-white">
            {t('title')}
          </h1>
          <p className="text-white/60 text-sm mt-0.5">
            {t('subtitle')} {user?.name}
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
                            className="
                relative flex-1 py-2 rounded-full text-sm font-semibold
                transition-all text-white/80 hover:text-white active:scale-95
              "
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-white/10 rounded-full shadow-md"
                />
              )}
              <span className="relative z-10">{t(`tabs.${tab}`)}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'diary' && (
              <DiaryView date={date} onDateChange={setDate} />
            )}
            {activeTab === 'stats' && (
              <StatsView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
