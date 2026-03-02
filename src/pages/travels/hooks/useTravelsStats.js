import { useMemo } from 'react'
import { useTrips } from './useTrips'
import { useFavoritePhotos } from './useTrips'

export function useTravelsStats() {
  const { data: trips = [], isLoading } = useTrips()
  const { data: favorites = [] } = useFavoritePhotos()

  const stats = useMemo(() => {
    const visitedCountries = [...new Set(
      trips.map(t => t.country_code).filter(Boolean)
    )]

    const tripsWithCoords = trips.filter(t => t.lat && t.lon)

    const byCountry = trips.reduce((acc, t) => {
      if (!t.country_code) return acc
      acc[t.country_code] = (acc[t.country_code] || 0) + 1
      return acc
    }, {})

    const topCountry = Object.entries(byCountry)
      .sort(([, a], [, b]) => b - a)[0]

    const tripsWithDates = trips.filter(t => t.start_date && t.end_date)
    const totalDays = tripsWithDates.reduce((sum, t) => {
      const days = Math.ceil(
        (new Date(t.end_date) - new Date(t.start_date)) / (1000 * 60 * 60 * 24)
      )
      return sum + days
    }, 0)

    const avgDays = tripsWithDates.length
      ? Math.round(totalDays / tripsWithDates.length)
      : 0

    const byYear = trips.reduce((acc, t) => {
      if (!t.start_date) return acc
      const year = new Date(t.start_date).getFullYear()
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {})

    const tripsByYear = Object.entries(byYear)
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year: Number(year), count }))

    return {
      totalTrips: trips.length,
      totalCountries: visitedCountries.length,
      visitedCountryCodes: visitedCountries,
      tripsWithCoords,
      topCountry: topCountry ? { code: topCountry[0], count: topCountry[1] } : null,
      totalDays,
      avgDays,
      tripsByYear,
      totalFavorites: favorites.length,
    }
  }, [trips, favorites])

  return { stats, isLoading, trips }
}