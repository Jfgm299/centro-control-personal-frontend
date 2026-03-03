import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const MIN_ZOOM = 1
const MAX_ZOOM = 12

function CircularFlag({ code, size = 28 }) {
  const lower = code.toLowerCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
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

export default function PassportMap({
  flights,
  uniqueCountryCodes,
  height = 650,
  initialZoom = 1,
  initialCenter = [0, 20],
}) {
  const [zoom, setZoom]     = useState(initialZoom)
  const [center, setCenter] = useState(initialCenter)
  const containerRef        = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const factor = e.deltaY > 0 ? 0.97 : 1.03
        setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor)))
      } else {
        e.stopImmediatePropagation()
        window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' })
      }
    }
    el.addEventListener('wheel', onWheel, { capture: true, passive: false })
    return () => el.removeEventListener('wheel', onWheel, { capture: true })
  }, [])

  const handleMoveEnd = useCallback(({ zoom: z, coordinates }) => {
    setZoom(z)
    setCenter(coordinates)
  }, [])

  const handleZoomIn  = () => setZoom(z => Math.min(z * 2, MAX_ZOOM))
  const handleZoomOut = () => setZoom(z => Math.max(z / 2, MIN_ZOOM))
  const handleReset   = () => { setZoom(initialZoom); setCenter(initialCenter) }

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
      .map(f => ({ from: [f.origin_lon, f.origin_lat], to: [f.destination_lon, f.destination_lat] }))
  }, [flights])

  const airports = useMemo(() => {
    const seen = new Map()
    flights
      .filter(f => f.is_past)
      .sort((a, b) => new Date(a.flight_date) - new Date(b.flight_date))
      .forEach(f => {
        if (f.origin_lat && !seen.has(f.origin_iata))
          seen.set(f.origin_iata, { iata: f.origin_iata, coords: [f.origin_lon, f.origin_lat] })
        if (f.destination_lat && !seen.has(f.destination_iata))
          seen.set(f.destination_iata, { iata: f.destination_iata, coords: [f.destination_lon, f.destination_lat] })
      })
    return [...seen.values()]
  }, [flights])

  const markerRadius = Math.max(0.8, 2.5 / Math.sqrt(zoom))
  const strokeWidth  = Math.max(0.2, 0.8 / Math.sqrt(zoom))

  return (
    <div style={{ background: 'linear-gradient(180deg, #1a0550 0%, #2d0a8a 100%)' }}>
      {/* Airport strip */}
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

      {/* Map — height controlada por prop */}
      <div ref={containerRef} style={{ position: 'relative', height, overflow: 'hidden' }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 140, center: [50, -90] }}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <ZoomableGroup zoom={zoom} center={center} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} onMoveEnd={handleMoveEnd}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#3d1f8a"
                    stroke="#5a2fd4"
                    strokeWidth={0.4 / zoom}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#4a2aaa' }, pressed: { outline: 'none' } }}
                  />
                ))
              }
            </Geographies>
            {routes.map((route, i) => (
              <Line key={i} from={route.from} to={route.to} stroke="#f59e0b" strokeWidth={strokeWidth} strokeOpacity={0.5} strokeLinecap="round" />
            ))}
            {airports.map(airport => (
              <Marker key={airport.iata} coordinates={airport.coords}>
                <circle r={markerRadius} fill="#f59e0b" stroke="#fff" strokeWidth={0.5 / zoom} opacity={0.9} />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ label: '+', action: handleZoomIn }, { label: '−', action: handleZoomOut }, { label: '⊙', action: handleReset }].map(({ label, action }) => (
            <button key={label} onClick={action}
              style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >{label}</button>
          ))}
        </div>

        {zoom > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '2px 8px', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace', backdropFilter: 'blur(4px)' }}>
            {zoom.toFixed(1)}×
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-1.5 px-3 py-3">
        {uniqueCountryCodes.map(code => (
          <CircularFlag key={code} code={code} size={30} />
        ))}
      </div>
    </div>
  )
}