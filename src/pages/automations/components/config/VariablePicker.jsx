import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Botón {{}} + dropdown para insertar variables de contexto en un campo.
 *
 * Uso:
 *   <VariablePicker
 *     variables={[{ path: 'payload.title', type: 'string', label: 'Título del evento' }]}
 *     onInsert={(varPath) => insertAtCursor(fieldRef, varPath)}
 *   />
 */
export default function VariablePicker({ variables = [], onInsert }) {
  const { t } = useTranslation('automations')
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const containerRef          = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = variables.filter((v) =>
    v.path.toLowerCase().includes(search.toLowerCase()) ||
    (v.label ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Agrupar por prefijo (payload.* vs vars.*)
  const groups = filtered.reduce((acc, v) => {
    const prefix = v.path.startsWith('payload.') ? 'payload'
                 : v.path.startsWith('vars.')    ? 'vars'
                 : 'other'
    if (!acc[prefix]) acc[prefix] = []
    acc[prefix].push(v)
    return acc
  }, {})

  const TYPE_COLOR = {
    string:  'bg-indigo-500/30 text-indigo-300 border-indigo-400/30',
    number:  'bg-amber-500/30 text-amber-300 border-amber-400/30',
    boolean: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/30',
    object:  'bg-violet-500/30 text-violet-300 border-violet-400/30',
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        title={t('variablePicker.title')}
        className={`bg-white/10 hover:bg-white/20 border border-white/15 text-white/60 hover:text-white text-xs font-mono font-bold rounded-lg px-2 py-1 cursor-pointer transition-all ${
          open ? 'bg-white/20 text-white' : ''
        }`}
      >
        {'{{}}'}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-[200] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl py-2 w-[260px] max-h-80 overflow-y-auto">
          {/* Search */}
          <div className="px-2.5 pb-2">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('variablePicker.search')}
              className="w-full box-border px-3 py-1.5 text-xs bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          {filtered.length === 0 && (
            <div className="text-white/30 text-sm text-center py-4">
              {t('variablePicker.noResults')}
            </div>
          )}

          {['payload', 'vars', 'other'].map((groupKey) => {
            const items = groups[groupKey]
            if (!items?.length) return null
            const groupLabel = groupKey === 'payload' ? t('variablePicker.payload')
                             : groupKey === 'vars'    ? t('variablePicker.vars')
                             : 'Otros'
            return (
              <div key={groupKey}>
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 py-1">
                  {groupLabel}
                </div>
                {items.map((v) => (
                  <button
                    key={v.path}
                    onClick={() => { onInsert(`{{${v.path}}}`); setOpen(false); setSearch('') }}
                    className="flex items-center gap-2 w-full px-3 py-2 border-none bg-transparent cursor-pointer text-left hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      TYPE_COLOR[v.type] ?? 'bg-white/10 text-white/40 border-white/10'
                    }`}>
                      {v.type ?? '?'}
                    </span>
                    <div className="min-w-0">
                      <div className="bg-white/10 text-white/70 font-mono text-xs px-2 py-0.5 rounded border border-white/10 truncate max-w-[160px] inline-block">
                        {v.path}
                      </div>
                      {v.label && (
                        <div className="text-white/40 text-[11px] mt-0.5">{v.label}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Helper: inserta texto en la posición del cursor de un <input> o <textarea>.
 * Llamar con la ref del campo y el texto a insertar.
 *
 *   insertAtCursor(inputRef, '{{payload.title}}')
 */
export function insertAtCursor(ref, text) {
  const el = ref?.current
  if (!el) return
  const start = el.selectionStart ?? el.value.length
  const end   = el.selectionEnd   ?? el.value.length
  const next  = el.value.slice(0, start) + text + el.value.slice(end)

  // Disparar evento sintético para que React actualice el estado
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set ?? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set

  nativeInputValueSetter?.call(el, next)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))

  // Reposicionar cursor tras el texto insertado
  const newPos = start + text.length
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(newPos, newPos)
  })
}
