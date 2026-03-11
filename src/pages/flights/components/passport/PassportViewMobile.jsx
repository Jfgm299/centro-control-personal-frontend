import { useState, useMemo } from 'react'
import { useFlightStats } from '../../hooks/useFlightStats'
import YearFilter     from './YearFilter'
import PassportMap    from './PassportMap'
import FlightsSection from './FlightsSection'
import DistanceSection from './DistanceSection'
import TimeSection    from './TimeSection'
import AirportsSection from './AirportsSection'
import AirlinesSection from './AirlinesSection'
import CountriesSection from './CountriesSection'

export default function PassportViewMobile({ flights }) {
  const [selectedYear, setSelectedYear] = useState(null)

  const filteredFlights = useMemo(() => {
    if (!selectedYear) return flights
    return flights.filter(f => new Date(f.flight_date).getFullYear() === selectedYear)
  }, [flights, selectedYear])

  const stats = useFlightStats(filteredFlights)
  const allStats = useFlightStats(flights)
  const availableYears = allStats?.availableYears || []

  if (!stats || stats.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/40 gap-2 bg-transparent">
        <span className="text-4xl">✈️</span>
        <p>Sin vuelos registrados aún</p>
      </div>
    )
  }

  return (
    <div className="bg-transparent min-h-full">
      <YearFilter years={availableYears} selected={selectedYear} onChange={setSelectedYear} />
      <PassportMap
        flights={filteredFlights}
        uniqueCountryCodes={stats.uniqueCountryCodes}
        height={340}
        initialZoom={1.5}
        initialCenter={[15, 25]}
      />
      <FlightsSection  stats={stats} />
      <DistanceSection stats={stats} />
      <TimeSection     stats={stats} />
      <AirportsSection stats={stats} />
      <AirlinesSection stats={stats} />
      <CountriesSection stats={stats} />
    </div>
  )
}