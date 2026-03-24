import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useFlights } from './hooks/useFlights'
import UpcomingFlights from './components/UpcomingFlights'
import PassportView    from './components/passport/PassportView'
import AddFlightModal  from './components/AddFlightModal'

export default function FlightsPageDesktop() {
  const { t }    = useTranslation('flights')
  const [tab, setTab] = useState('upcoming')
  const [showAdd, setShowAdd] = useState(false)
  const { flights, upcoming, isLoading } = useFlights()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full text-white p-4 md:p-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-4 pb-0 mb-4 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-white mb-4">{t('title')}</h1>

        {/* Tabs + Add button en la misma fila */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm">
            {['upcoming', 'passport'].map(tabId => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={clsx(
                  'px-5 py-2 text-sm font-medium rounded-full transition-all relative',
                  tab === tabId
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                )}
              >
                {tab === tabId && (
                  <motion.div
                    layoutId="active-tab-indicator-flights-desktop"
                    className="absolute inset-0 bg-white/10 rounded-full shadow-md"
                  />
                )}
                <span className="relative z-10 flex items-center">
                  {t(`tabs.${tabId}`)}
                  {tabId === 'upcoming' && upcoming.length > 0 && (
                    <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {upcoming.length}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {tab === 'upcoming' && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {t('upcoming.addFlight')}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'upcoming' ? (
          <div className="h-full overflow-y-auto no-scrollbar">
            <UpcomingFlights flights={upcoming} onAdd={() => setShowAdd(true)} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto no-scrollbar">
            <PassportView flights={flights} />
          </div>
        )}
      </div>

      {showAdd && <AddFlightModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}