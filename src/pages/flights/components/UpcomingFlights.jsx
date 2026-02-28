import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FlightCard from './FlightCard'
import AddFlightModal from './AddFlightModal'

export default function UpcomingFlights({ flights }) {
  const { t } = useTranslation('flights')
  const [showAdd, setShowAdd] = useState(false)

  // Orden cronológico
  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      const dateA = new Date(
        a.scheduled_departure || `${a.flight_date}T00:00:00`
      )
      const dateB = new Date(
        b.scheduled_departure || `${b.flight_date}T00:00:00`
      )
      return dateA - dateB
    })
  }, [flights])

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          {sortedFlights.length} upcoming
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
        >
          <span>+</span>
          {t('upcoming.addFlight')}
        </button>
      </div>

      {sortedFlights.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <span className="text-5xl">✈️</span>
          <p className="text-gray-500 font-medium">{t('upcoming.empty')}</p>
          <p className="text-gray-400 text-sm">{t('upcoming.emptyHint')}</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 px-5 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
          >
            {t('upcoming.addFlight')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedFlights.map(flight => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}

      {showAdd && <AddFlightModal onClose={() => setShowAdd(false)} />}
    </>
  )
}