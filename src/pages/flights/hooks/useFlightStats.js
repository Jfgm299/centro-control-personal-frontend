import { useMemo } from 'react'

const EARTH_KM    = 40075
const SUN_ORBIT_KM = 940000000

// ISO-2 → emoji flag
export const toFlag = (code) => {
  if (!code || code.length !== 2) return '🌐'
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  )
}

// Classify flight
const classifyFlight = (f) => {
  if (f.origin_country_code && f.destination_country_code &&
      f.origin_country_code === f.destination_country_code) return 'domestic'
  if (f.distance_km && f.distance_km > 3500) return 'longHaul'
  return 'international'
}

// JS day (0=Sun) → Mon-indexed (0=Mon)
const toMonIndex = (d) => (d === 0 ? 6 : d - 1)

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Country → region mapping (ISO-2)
const REGION_MAP = {
  europe:    new Set(['AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','UA','GB','VA']),
  middleEast:new Set(['BH','EG','IR','IQ','IL','JO','KW','LB','OM','PS','QA','SA','SY','TR','AE','YE']),
  africa:    new Set(['DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW']),
  asia:      new Set(['AF','AM','AZ','BD','BT','BN','KH','CN','GE','IN','ID','JP','KZ','KG','LA','MY','MV','MN','MM','NP','KP','PK','PH','SG','KR','LK','TJ','TH','TL','TM','UZ','VN']),
  cAmerica:  new Set(['BZ','CR','SV','GT','HN','MX','NI','PA']),
  caribbean: new Set(['AG','BS','BB','CU','DM','DO','GD','HT','JM','KN','LC','VC','TT']),
  nAmerica:  new Set(['CA','US']),
  oceania:   new Set(['AU','FJ','KI','MH','FM','NR','NZ','PW','PG','WS','SB','TO','TV','VU']),
  sAmerica:  new Set(['AR','BO','BR','CL','CO','EC','GY','PY','PE','SR','UY','VE']),
}

export const useFlightStats = (flights) => {
  return useMemo(() => {
    if (!flights.length) return null

    const past = flights.filter(f => f.is_past)
    if (!past.length) return null

    // Totals
    const total       = past.length
    const totalDist   = past.reduce((s, f) => s + (f.distance_km || 0), 0)
    const totalMins   = past.reduce((s, f) => s + (f.duration_minutes || 0), 0)
    const totalHours  = totalMins / 60

    // Classification
    const domestic     = past.filter(f => classifyFlight(f) === 'domestic').length
    const longHaul     = past.filter(f => classifyFlight(f) === 'longHaul').length
    const international = total - domestic - longHaul

    // Weekday distribution
    const weekdayCounts = WEEKDAYS.map((day, i) => ({
      day,
      count: past.filter(f => toMonIndex(new Date(f.flight_date).getDay()) === i).length,
    }))

    // Month distribution
    const monthCounts = MONTHS.map((month, i) => ({
      month,
      count: past.filter(f => new Date(f.flight_date).getMonth() === i).length,
    }))

    // Year distribution
    const yearMap = {}
    past.forEach(f => {
      const y = new Date(f.flight_date).getFullYear()
      yearMap[y] = (yearMap[y] || 0) + 1
    })
    const yearCounts = Object.entries(yearMap)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year)

    // Around Earth / Sun
    const aroundEarth = totalDist / EARTH_KM
    const aroundSun   = totalDist / SUN_ORBIT_KM

    // Unique airports
    const airportMap = {}
    past.forEach(f => {
      const addAirport = (iata, name, city, country) => {
        if (!iata) return
        if (!airportMap[iata]) airportMap[iata] = { iata, name, city, country, count: 0 }
        airportMap[iata].count++
      }
      addAirport(f.origin_iata, f.origin_name, f.origin_city, f.origin_country_code)
      addAirport(f.destination_iata, f.destination_name, f.destination_city, f.destination_country_code)
    })
    const topAirports = Object.values(airportMap).sort((a, b) => b.count - a.count)

    // Unique airlines
    const airlineMap = {}
    past.forEach(f => {
      if (!f.airline_iata) return
      if (!airlineMap[f.airline_iata]) {
        airlineMap[f.airline_iata] = {
          iata: f.airline_iata,
          name: f.airline_name || f.airline_iata,
          count: 0,
          distance: 0,
        }
      }
      airlineMap[f.airline_iata].count++
      airlineMap[f.airline_iata].distance += f.distance_km || 0
    })
    const topAirlines = Object.values(airlineMap).sort((a, b) => b.count - a.count)

    // Countries
    const countryMap = {}
    past.forEach(f => {
      const addCountry = (code) => {
        if (!code) return
        if (!countryMap[code]) countryMap[code] = { code, count: 0 }
        countryMap[code].count++
      }
      addCountry(f.origin_country_code)
      addCountry(f.destination_country_code)
    })
    const topCountries = Object.values(countryMap).sort((a, b) => b.count - a.count)
    const uniqueCountryCodes = topCountries.map(c => c.code)

    // Regions
    const regions = Object.entries(REGION_MAP).map(([key, codes]) => {
      const count = uniqueCountryCodes.filter(c => codes.has(c)).length
      const pct   = uniqueCountryCodes.length > 0
        ? Math.round((count / uniqueCountryCodes.length) * 100)
        : 0
      return { key, count, pct }
    })

    // Shortest / Longest
    const withDist     = past.filter(f => f.distance_km)
    const shortest     = withDist.length ? withDist.reduce((a, b) => a.distance_km < b.distance_km ? a : b) : null
    const longest      = withDist.length ? withDist.reduce((a, b) => a.distance_km > b.distance_km ? a : b) : null

    // Available years for filter
    const availableYears = Object.keys(yearMap).map(Number).sort((a, b) => b - a)

    return {
      total, totalDist, totalHours, totalMins,
      domestic, international, longHaul,
      avgDist: total ? totalDist / total : 0,
      avgHours: total ? totalHours / total : 0,
      weekdayCounts, monthCounts, yearCounts,
      aroundEarth, aroundSun,
      topAirports, topAirlines,
      topCountries, uniqueCountryCodes, regions,
      shortest, longest,
      availableYears,
      uniqueAirports: topAirports.length,
      uniqueAirlines: topAirlines.length,
      uniqueCountries: topCountries.length,
    }
  }, [flights])
}