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
    string:  '#6366f1',
    number:  '#f59e0b',
    boolean: '#22c55e',
    object:  '#8b5cf6',
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={t('variablePicker.title')}
        style={{
          padding: '3px 8px', borderRadius: 6,
          border: '1px solid #e5e7eb',
          background: open ? '#f3f4f6' : '#fff',
          color: '#6366f1', fontSize: 11, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'monospace',
        }}
      >
        {'{{}}'}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 30, zIndex: 200,
          background: '#fff', borderRadius: 12, padding: '8px 0',
          boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
          border: '1px solid #f0f0f0',
          width: 260, maxHeight: 320, overflowY: 'auto',
        }}>
          {/* Search */}
          <div style={{ padding: '0 10px 8px' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('variablePicker.search')}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '5px 10px', fontSize: 12,
                border: '1px solid #e5e7eb', borderRadius: 8,
                outline: 'none', color: '#111827',
              }}
            />
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
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
                <div style={{
                  padding: '4px 12px 2px',
                  fontSize: 10, fontWeight: 700, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                }}>
                  {groupLabel}
                </div>
                {items.map((v) => (
                  <button
                    key={v.path}
                    onClick={() => { onInsert(`{{${v.path}}}`); setOpen(false); setSearch('') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '6px 12px',
                      border: 'none', background: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 5px',
                      borderRadius: 4, color: '#fff',
                      background: TYPE_COLOR[v.type] ?? '#94a3b8',
                      flexShrink: 0,
                    }}>
                      {v.type ?? '?'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', fontFamily: 'monospace' }}>
                        {v.path}
                      </div>
                      {v.label && (
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{v.label}</div>
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