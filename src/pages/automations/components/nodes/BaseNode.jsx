import { useReactFlow } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'

// Keyframes inyectados una sola vez globalmente
const STYLES = `
  @keyframes cc-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes cc-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`
let stylesInjected = false
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = STYLES
  document.head.appendChild(el)
  stylesInjected = true
}

export default function BaseNode({ id, children, minWidth = 220, selected = false }) {
  injectStyles()

  const { t } = useTranslation('automations')
  const { deleteElements } = useReactFlow()
  const executionState = useAutomationsStore((s) => s.executionState[id])
  const status = executionState?.status

  const handleDelete = (e) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  // ── Border config por estado ───────────────────────────────────────────────
  const isRunning  = status === 'running'
  const isSuccess  = status === 'success'
  const isFailed   = status === 'failed'
  const isSkipped  = status === 'skipped'
  const isSelected = !status && selected

  const borderColor = isSuccess  ? 'rgba(34,197,94,0.5)'
                    : isFailed   ? 'rgba(239,68,68,0.5)'
                    : isSkipped  ? 'rgba(255,255,255,0.08)'
                    : isSelected ? 'rgba(255,255,255,0.4)'
                    :              'rgba(255,255,255,0.15)'

  const bgColor = isSuccess ? 'rgba(34,197,94,0.10)'
                : isFailed  ? 'rgba(239,68,68,0.10)'
                : isSkipped ? 'rgba(255,255,255,0.04)'
                : isSelected ? 'rgba(255,255,255,0.12)'
                :             'rgba(255,255,255,0.08)'

  const borderWidth = isSuccess || isFailed || isSelected ? 2 : 1.5

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Botón eliminar (visible al hover/seleccionar) ── */}
      {(selected || isRunning === false) && !isRunning && (
        <button
          onClick={handleDelete}
          title={t('nodes.deleteTitle')}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 18, height: 18,
            borderRadius: '50%',
            background: selected ? '#ef4444' : '#9ca3af',
            border: '2px solid rgba(255,255,255,0.5)',
            color: '#fff',
            fontSize: 10, fontWeight: 700, lineHeight: 1,
            cursor: 'pointer',
            display: selected ? 'flex' : 'none',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            padding: 0,
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
          onMouseOut={e => e.currentTarget.style.background = selected ? '#ef4444' : '#9ca3af'}
        >
          ×
        </button>
      )}

      {/* ── Spinning border (solo cuando running) ── */}
      {isRunning && (
        <div style={{
          position: 'absolute', inset: -2,
          borderRadius: 14,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          {/* Track gris */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 14,
            border: '2px solid rgba(255,255,255,0.08)',
          }} />
          {/* Spinner giratorio */}
          <div style={{
            position: 'absolute',
            inset: '-100%',
            background: 'conic-gradient(from 0deg, transparent 0deg, #93c5fd 30deg, #3b82f6 60deg, transparent 90deg)',
            animation: 'cc-spin 1s linear infinite',
          }} />
          {/* Máscara interior para que solo se vea el borde */}
          <div style={{
            position: 'absolute',
            inset: 2,
            borderRadius: 12,
            background: 'rgba(15,23,42,0.85)',
          }} />
        </div>
      )}

      {/* ── Nodo real ── */}
      <div style={{
        minWidth,
        borderRadius: 12,
        border: `${borderWidth}px solid ${isRunning ? 'transparent' : borderColor}`,
        background: isRunning ? 'rgba(15,23,42,0.85)' : bgColor,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        position: 'relative',
        zIndex: 1,
        transition: 'border-color 0.25s, background 0.25s',
      }}>
        {children}
      </div>

      {/* ── Badge duración (debajo del nodo) ── */}
      {executionState?.duration_ms != null && !isRunning && (
        <div style={{
          position: 'absolute', bottom: -20, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10, fontWeight: 700,
          color:      isSuccess ? '#4ade80' : isFailed ? '#f87171' : 'rgba(255,255,255,0.45)',
          background: isSuccess ? 'rgba(34,197,94,0.15)' : isFailed ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
          padding: '2px 7px', borderRadius: 6,
          whiteSpace: 'nowrap',
          animation: 'cc-fade-in 0.2s ease',
          border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.25)' : isFailed ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          {isSuccess ? '✓' : '✗'} {executionState.duration_ms}ms
        </div>
      )}

      {/* ── Tooltip error (encima del nodo) ── */}
      {isFailed && executionState?.error && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: '#fff',
          fontSize: 11, padding: '5px 10px', borderRadius: 7,
          whiteSpace: 'nowrap', maxWidth: 280,
          overflow: 'hidden', textOverflow: 'ellipsis',
          zIndex: 20, pointerEvents: 'none',
          animation: 'cc-fade-in 0.2s ease',
        }}>
          {executionState.error}
          {/* Flecha */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(0,0,0,0.85)',
          }} />
        </div>
      )}
    </div>
  )
}