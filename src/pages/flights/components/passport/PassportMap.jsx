import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps'
import { motion } from 'framer-motion'
import { isPastFlight } from '../../hooks/useFlights'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const MIN_ZOOM = 1
const MAX_ZOOM = 12

function CircularFlag({ code, size = 28 }) {
  const lower = code.toLowerCase()
  return (
    <motion.div 
      whileHover={{ scale: 1.1, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="relative flex-shrink-0 rounded-full overflow-hidden shadow-lg border border-white/40 group"
      style={{
        width: size,
        height: size,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
        transform: 'translateZ(0)',
        isolation: 'isolate',
      }}
    >
      {/* Overlay sutil para brillo interno */}
      <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none z-10 mix-blend-overlay"></div>
      
      <img
        src={`https://flagcdn.com/w40/${lower}.png`}
        alt={code}
        className="w-full h-full object-cover relative z-0"
        onError={(e) => { e.target.style.display = 'none' }}
      />
    </motion.div>
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
      .filter(f => isPastFlight(f) && f.origin_lat && f.destination_lat)
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
      .filter(isPastFlight)
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
    <div className="bg-white/5 backdrop-blur-md border-y border-white/10 mt-4 rounded-3xl overflow-hidden shadow-xl mx-0">
      {/* Airport strip */}
      <div className="overflow-hidden py-3 px-4 border-b border-white/10 bg-black/20">
        <div className="flex gap-4 text-white/70 text-xs font-mono">
          {airports.slice(0, 20).map(a => (
            <span key={a.iata} className="flex items-center gap-1.5 shrink-0">
              <span className="text-blue-400">✈</span>
              {a.iata}
            </span>
          ))}
        </div>
      </div>

      {/* Map — height controlada por prop */}
      <div ref={containerRef} style={{ position: 'relative', height, overflow: 'hidden' }} className="bg-black/10">
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
                    fill="rgba(255, 255, 255, 0.1)"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={0.4 / zoom}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: 'rgba(255, 255, 255, 0.15)' }, pressed: { outline: 'none' } }}
                  />
                ))
              }
            </Geographies>
            {routes.map((route, i) => (
              <Line key={i} from={route.from} to={route.to} stroke="#60a5fa" strokeWidth={strokeWidth} strokeOpacity={0.6} strokeLinecap="round" />
            ))}
            {airports.map(airport => (
              <Marker key={airport.iata} coordinates={airport.coords}>
                <circle r={markerRadius} fill="#60a5fa" stroke="#fff" strokeWidth={0.5 / zoom} opacity={0.9} />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ label: '+', action: handleZoomIn }, { label: '−', action: handleZoomOut }, { label: '⊙', action: handleReset }].map(({ label, action }) => (
            <button key={label} onClick={action}
              style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >{label}</button>
          ))}
        </div>

        {zoom > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace', backdropFilter: 'blur(8px)' }}>
            {zoom.toFixed(1)}×
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2 p-4 bg-black/20">
        {uniqueCountryCodes.map(code => (
          <CircularFlag key={code} code={code} size={36} />
        ))}
      </div>
    </div>
  )
}