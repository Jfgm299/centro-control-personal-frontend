import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useFlights } from './hooks/useFlights'
import FlightCardMobile from './components/FlightCardMobile'
import AddFlightModal from './components/AddFlightModal'
import PassportViewMobile from './components/passport/PassportViewMobile'

export default function FlightsPageMobile() {
  const { t } = useTranslation('flights')
  const [tab, setTab] = useState('upcoming')
  const [showAdd, setShowAdd] = useState(false)
  const { flights, upcoming, isLoading } = useFlights()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-0 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{t('title')}</h1>

        {/* Tabs + Add button en la misma fila */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {['upcoming', 'passport'].map(tabId => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all',
                  tab === tabId ? 'bg-sky-500 text-white' : 'text-gray-500'
                )}
              >
                {t(`tabs.${tabId}`)}
                {tabId === 'upcoming' && upcoming.length > 0 && (
                  <span className="ml-1.5 bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {upcoming.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'upcoming' && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white text-sm font-medium rounded-xl mb-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {t('upcoming.addFlight')}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'upcoming' ? (
          <div className="px-5 py-4 flex flex-col gap-2 pb-32">
            {upcoming.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12">{t('upcoming.empty')}</p>
            ) : (
              upcoming.map(flight => (
                <FlightCardMobile key={flight.id} flight={flight} />
              ))
            )}
          </div>
        ) : (
          <div className="pb-32">
            <PassportViewMobile flights={flights} />
          </div>
        )}
      </div>

      {showAdd && <AddFlightModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}