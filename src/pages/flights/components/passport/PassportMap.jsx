import { useMemo } from 'react'
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function CircularFlag({ code, size = 28 }) {
  const lower = code.toLowerCase()
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.3)',
        flexShrink: 0,
      }}
    >
      <img
        src={`https://flagcdn.com/w40/${lower}.png`}
        alt={code}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
    </div>
  )
}

export { CircularFlag }

export default function PassportMap({ flights, uniqueCountryCodes }) {
  const routes = useMemo(() => {
    const seen = new Set()
    return flights
      .filter(f => f.is_past && f.origin_lat && f.destination_lat)
      .filter(f => {
        const key = [f.origin_iata, f.destination_iata].sort().join('-')
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map(f => ({
        from: [f.origin_lon, f.origin_lat],
        to:   [f.destination_lon, f.destination_lat],
      }))
  }, [flights])

  const airports = useMemo(() => {
    const seen = new Map()
    flights.filter(f => f.is_past).forEach(f => {
      if (f.origin_lat && !seen.has(f.origin_iata)) {
        seen.set(f.origin_iata, { iata: f.origin_iata, coords: [f.origin_lon, f.origin_lat] })
      }
      if (f.destination_lat && !seen.has(f.destination_iata)) {
        seen.set(f.destination_iata, { iata: f.destination_iata, coords: [f.destination_lon, f.destination_lat] })
      }
    })
    return [...seen.values()]
  }, [flights])

  return (
    <div style={{ background: 'linear-gradient(180deg, #1a0550 0%, #2d0a8a 100%)' }}>
      
      {/* Scrolling strip */}
      <div className="overflow-hidden py-2 px-2 border-b border-white/10">
        <div className="flex gap-3 text-white/60 text-xs font-mono">
          {airports.slice(0, 20).map(a => (
            <span key={a.iata} className="flex items-center gap-1 shrink-0">
              <span className="text-[#f59e0b]">✈</span>
              {a.iata}
            </span>
          ))}
        </div>
      </div>

      {/* World map */}
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 140 }}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#3d1f8a"
                stroke="#5a2fd4"
                strokeWidth={0.4}
                style={{
                  default: { outline: 'none' },
                  hover:   { outline: 'none', fill: '#4a2aaa' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {routes.map((route, i) => (
          <Line
            key={i}
            from={route.from}
            to={route.to}
            stroke="#f59e0b"
            strokeWidth={0.8}
            strokeOpacity={0.5}
            strokeLinecap="round"
          />
        ))}

        {airports.map(airport => (
          <Marker key={airport.iata} coordinates={airport.coords}>
            <circle
              r={2.5}
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth={0.5}
              opacity={0.9}
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* Circular flags */}
      <div className="flex flex-wrap gap-1.5 px-3 py-3">
        {uniqueCountryCodes.map(code => (
          <CircularFlag key={code} code={code} size={30} />
        ))}
      </div>

    </div>
  )
}