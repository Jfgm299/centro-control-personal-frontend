import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DiaryView from './components/diary/DiaryView'
import StatsView from './components/stats/StatsView'

const TABS = ['diary', 'stats']

export default function MacroPage() {
  const { t } = useTranslation('macro')

  const today = new Date().toISOString().split('T')[0]
  const [activeTab, setActiveTab] = useState('diary')
  const [date, setDate]           = useState(today)

  return (
    <div className="p-4 pb-10 max-w-2xl mx-auto space-y-4">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'diary' && (
        <DiaryView date={date} onDateChange={setDate} />
      )}
      {activeTab === 'stats' && (
        <StatsView />
      )}
    </div>
  )
}