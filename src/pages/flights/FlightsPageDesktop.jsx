import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
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
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full -mx-8 -mt-8">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('title')}</h1>

        {/* Tabs + Add button en la misma fila */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {['upcoming', 'passport'].map(tabId => (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={clsx(
                  'px-5 py-2 text-sm font-medium rounded-xl transition-all',
                  tab === tabId
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t(`tabs.${tabId}`)}
                {tabId === 'upcoming' && upcoming.length > 0 && (
                  <span className="ml-2 bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {upcoming.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'upcoming' && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 transition-all mb-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {t('actions.add')}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'upcoming' ? (
          <div className="p-8 h-full overflow-y-auto">
            <UpcomingFlights flights={upcoming} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <PassportView flights={flights} />
          </div>
        )}
      </div>

      {showAdd && <AddFlightModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}