import { useMemo, useState } from 'react'

function stringifyPreview(value) {
  if (value === undefined) return null
  if (value === null) return 'null'
  if (typeof value === 'string') return value.length > 120 ? `${value.slice(0, 120)}...` : value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    const raw = JSON.stringify(value)
    return raw.length > 120 ? `${raw.slice(0, 120)}...` : raw
  } catch {
    return '[preview unavailable]'
  }
}

/**
 * Draggable variable chip for expression insertion.
 */
export default function ParameterPill({
  variable,
  previewValue,
  onInsert,
  className = '',
}) {
  const [hovered, setHovered] = useState(false)

  const label = variable?.label ?? variable?.path ?? 'variable'
  const path = variable?.path ?? ''
  const token = `{{${path}}}`
  const preview = useMemo(() => stringifyPreview(previewValue ?? variable?.value), [previewValue, variable?.value])

  const handleDragStart = (e) => {
    if (!path) return
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('variable', path)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        draggable={Boolean(path)}
        onDragStart={handleDragStart}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onInsert?.(token)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/15 bg-white/8 hover:bg-white/12 text-white/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
        title={path}
      >
        <span className="text-white/35">{`{}`}</span>
        <span className="truncate max-w-[170px]">{label}</span>
      </button>

      {hovered && preview && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[210] w-[260px] rounded-xl border border-white/15 bg-black/85 backdrop-blur-xl px-2.5 py-2 text-[11px] text-white/70 shadow-xl">
          <div className="text-white/35 mb-1">Preview</div>
          <div className="font-mono break-words">{preview}</div>
        </div>
      )}
    </div>
  )
}
