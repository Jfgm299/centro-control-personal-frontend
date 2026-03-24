import { useTranslation } from 'react-i18next'
import FlightCard from './FlightCard'

export default function UpcomingFlights({ flights, onAdd }) {
  const { t } = useTranslation('flights')

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white/80">
          {flights.length} upcoming
        </h2>
      </div>

      {flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <span className="text-5xl">✈️</span>
          <p className="text-white/70 font-medium">{t('upcoming.empty')}</p>
          <p className="text-white/40 text-sm">{t('upcoming.emptyHint')}</p>
          <button
            onClick={onAdd}
            className="mt-2 px-5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm shadow-sm"
          >
            {t('upcoming.addFlight')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {flights.map(flight => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </>
  )
}