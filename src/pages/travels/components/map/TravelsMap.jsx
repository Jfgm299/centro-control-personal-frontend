import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
  ComposableMap, Geographies, Geography,
  Marker, ZoomableGroup,
} from 'react-simple-maps'
import { ISO2_TO_NUMERIC, MAP_COLORS } from '../../constants'
import TripMarker from './TripMarker'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const MIN_ZOOM = 1
const MAX_ZOOM = 12

function CircularFlag({ code, size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0,
    }}>
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        alt={code}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.style.display = 'none' }}
      />
    </div>
  )
}

export default function TravelsMap({ trips = [], visitedCountryCodes = [], onTripClick }) {
  const [zoom, setZoom]         = useState(1)
  const [center, setCenter]     = useState([0, -40])
  const [activeGroup, setActiveGroup] = useState(null) // { coords, trips[] }
  const containerRef            = useRef(null)

  // Visited country numeric IDs for fast lookup
  const visitedNumericIds = useMemo(() => {
    const set = new Set()
    visitedCountryCodes.forEach(code => {
      const id = ISO2_TO_NUMERIC[code]
      if (id) set.add(id)
    })
    return set
  }, [visitedCountryCodes])

  // Group trips by location (same lat/lon rounded to 1 decimal)
  const markerGroups = useMemo(() => {
    const groups = new Map()
    trips.filter(t => t.lat && t.lon).forEach(trip => {
      const key = `${trip.lat.toFixed(1)},${trip.lon.toFixed(1)}`
      if (!groups.has(key)) {
        groups.set(key, { coords: [trip.lon, trip.lat], trips: [] })
      }
      groups.get(key).trips.push(trip)
    })
    return [...groups.values()]
  }, [trips])

  // Scroll interception — same pattern as PassportMap
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
    setActiveGroup(null)
  }, [])

  const handleZoomIn  = () => setZoom(z => Math.min(z * 2, MAX_ZOOM))
  const handleZoomOut = () => setZoom(z => Math.max(z / 2, MIN_ZOOM))
  const handleReset   = () => { setZoom(1); setCenter([0, 20]); setActiveGroup(null) }

  const markerRadius = Math.max(0.8, 3 / Math.sqrt(zoom))
  const strokeWidth  = Math.max(0.2, 0.8 / Math.sqrt(zoom))

  return (
    <div style={{ background: `linear-gradient(180deg, ${MAP_COLORS.ocean} 0%, ${MAP_COLORS.oceanGradient} 100%)` }}>

      {/* Visited countries strip */}
      {visitedCountryCodes.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 overflow-x-auto">
          <span className="text-white/40 text-xs font-mono shrink-0">
            {visitedCountryCodes.length} countries
          </span>
          <div className="flex gap-1.5">
            {visitedCountryCodes.map(code => (
              <CircularFlag key={code} code={code} size={22} />
            ))}
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={containerRef} style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 140, center: [0, -40] }}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const numId = String(geo.id).padStart(3, '0')
                  const isVisited = visitedNumericIds.has(numId)
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isVisited ? MAP_COLORS.visited : MAP_COLORS.land}
                      stroke={MAP_COLORS.landStroke}
                      strokeWidth={0.4 / zoom}
                      style={{
                        default: { outline: 'none' },
                        hover:   { outline: 'none', fill: isVisited ? MAP_COLORS.visitedHover : '#4a2aaa' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {/* Trip markers */}
            {markerGroups.map((group, i) => (
              <Marker
                key={i}
                coordinates={group.coords}
                onClick={() => setActiveGroup(group)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={markerRadius * (group.trips.length > 1 ? 1.4 : 1)}
                  fill={MAP_COLORS.marker}
                  stroke={MAP_COLORS.markerStroke}
                  strokeWidth={strokeWidth}
                  opacity={0.95}
                />
                {group.trips.length > 1 && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: markerRadius * 0.9,
                      fill: '#1a0550',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                    }}
                  >
                    {group.trips.length}
                  </text>
                )}
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Floating trip popup */}
        {activeGroup && (
          <TripMarker
            group={activeGroup}
            onClose={() => setActiveGroup(null)}
            onTripClick={onTripClick}
          />
        )}

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: '+', action: handleZoomIn,  title: 'Zoom in'  },
            { label: '−', action: handleZoomOut, title: 'Zoom out' },
            { label: '⊙', action: handleReset,   title: 'Reset'    },
          ].map(({ label, action, title }) => (
            <button
              key={label}
              onClick={action}
              title={title}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              {label}
            </button>
          ))}
        </div>

        {zoom > 1 && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 6, padding: '2px 8px',
            color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace',
            backdropFilter: 'blur(4px)',
          }}>
            {zoom.toFixed(1)}×
          </div>
        )}
      </div>
    </div>
  )
}