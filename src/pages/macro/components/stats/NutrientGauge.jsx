export default function NutrientGauge({ label, current, goal, color, unit = 'g' }) {
  const SIZE   = 88
  const STROKE = 7
  const R      = (SIZE - STROKE) / 2
  const CIRC   = 2 * Math.PI * R

  const pct      = goal > 0 ? Math.min(current / goal, 1) : 0
  const over     = goal > 0 && current > goal
  const dashOff  = CIRC * (1 - pct)
  const fillColor = over ? '#ef4444' : color

  const fmtVal = (v) => {
    if (v == null) return '0'
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString()
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={fillColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOff}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Center text */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            lineHeight: 1.1,
          }}
        >
          <span className="text-sm font-bold" style={{ color: fillColor }}>
            {fmtVal(current)}
          </span>
          <span className="text-gray-400 text-xs">{unit}</span>
        </div>
      </div>

      {/* Label + goal */}
      <div className="text-center">
        <p className="text-gray-700 text-xs font-semibold">{label}</p>
        <p className="text-gray-300 text-xs">/ {fmtVal(goal)}{unit}</p>
      </div>
    </div>
  )
}