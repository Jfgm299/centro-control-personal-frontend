import { useState } from 'react'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * Panel derecho al estilo n8n que aparece al hacer click en un nodo
 * que tiene datos de ejecución. Muestra Input / Output en JSON viewer.
 */
export default function NodeOutputPanel({ node, onClose, inline = false }) {
  const nodeOutputData  = useAutomationsStore((s) => s.nodeOutputData)
  const lastResult      = useAutomationsStore((s) => s.lastExecutionResult)

  const [tab, setTab] = useState('output')

  if (!node) return null

  const data   = nodeOutputData[node.id]
  const hasRun = !!data

  // Si el nodo no tiene datos de ejecución, mostrar panel de config normal
  // (esto lo gestiona AutomationEditor — aquí asumimos que hay datos)

  const nodeLabel = node.data?.label ?? node.type ?? 'Nodo'
  const status    = data?.status
  const isSuccess = status === 'success'
  const isFailed  = status === 'failed'

  return (
    <div style={{
      width: inline ? '100%' : 340,
      height: '100%',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #2d2d4e',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      flexShrink: 0,
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid #2d2d4e',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: isSuccess ? '#22c55e' : isFailed ? '#ef4444' : '#6b7280',
          boxShadow: isSuccess ? '0 0 6px #22c55e' : isFailed ? '0 0 6px #ef4444' : 'none',
        }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nodeLabel}
        </span>
        {data?.duration_ms != null && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
            background: isSuccess ? '#14532d' : '#7f1d1d',
            color: isSuccess ? '#4ade80' : '#fca5a5',
          }}>
            {data.duration_ms}ms
          </span>
        )}
        <button onClick={onClose} style={{
          border: 'none', background: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: 18, padding: '0 2px', lineHeight: 1,
        }}>×</button>
      </div>

      {/* ── Error banner ── */}
      {isFailed && data?.error && (
        <div style={{
          margin: '10px 12px 0',
          padding: '8px 12px',
          background: '#450a0a',
          border: '1px solid #7f1d1d',
          borderRadius: 8,
          fontSize: 12,
          color: '#fca5a5',
          lineHeight: 1.5,
        }}>
          ❌ {data.error}
        </div>
      )}

      {/* ── Tabs ── */}
      {hasRun && (
        <>
          <div style={{
            display: 'flex',
            padding: '10px 12px 0',
            gap: 4,
            borderBottom: '1px solid #2d2d4e',
          }}>
            {['input', 'output'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 14px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: tab === t ? '#2d2d4e' : 'transparent',
                color: tab === t ? '#a5b4fc' : '#6b7280',
                borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                {t === 'input' ? 'INPUT' : 'OUTPUT'}
              </button>
            ))}
          </div>

          {/* ── JSON body ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <JsonViewer data={tab === 'input' ? data.input : data.output} />
          </div>
        </>
      )}

      {!hasRun && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4b5563',
          fontSize: 12,
          textAlign: 'center',
          padding: 24,
        }}>
          Ejecuta el flujo para ver<br />los datos de este nodo
        </div>
      )}
    </div>
  )
}


// ── JSON Viewer ───────────────────────────────────────────────────────────────

function JsonViewer({ data }) {
  if (data === null || data === undefined) {
    return (
      <div style={{ color: '#4b5563', fontSize: 12, fontStyle: 'italic', padding: 8 }}>
        Sin datos
      </div>
    )
  }

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 8,
      padding: '10px 12px',
      fontSize: 12,
      lineHeight: 1.7,
      overflowX: 'auto',
    }}>
      <JsonNode value={data} indent={0} />
    </div>
  )
}

function JsonNode({ value, indent }) {
  const [collapsed, setCollapsed] = useState(false)
  const pad = '  '.repeat(indent)

  if (value === null) return <span style={{ color: '#94a3b8' }}>null</span>
  if (typeof value === 'boolean') return <span style={{ color: '#f472b6' }}>{String(value)}</span>
  if (typeof value === 'number') return <span style={{ color: '#fb923c' }}>{value}</span>
  if (typeof value === 'string') return <span style={{ color: '#4ade80' }}>"{value}"</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#94a3b8' }}>[]</span>
    return (
      <span>
        <button onClick={() => setCollapsed(v => !v)} style={collapseBtn}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span style={{ color: '#94a3b8' }}>[</span>
        {collapsed
          ? <span style={{ color: '#6b7280', cursor: 'pointer' }} onClick={() => setCollapsed(false)}>
              {' '}{value.length} items{' '}
            </span>
          : (
            <div style={{ marginLeft: 16 }}>
              {value.map((item, i) => (
                <div key={i}>
                  <JsonNode value={item} indent={indent + 1} />
                  {i < value.length - 1 && <span style={{ color: '#4b5563' }}>,</span>}
                </div>
              ))}
            </div>
          )
        }
        <span style={{ color: '#94a3b8' }}>]</span>
        <span style={{ color: '#6b7280', fontSize: 10, marginLeft: 8 }}>
          // {value.length} item{value.length !== 1 ? 's' : ''}
        </span>
      </span>
    )
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return <span style={{ color: '#94a3b8' }}>{'{}'}</span>
    return (
      <span>
        <button onClick={() => setCollapsed(v => !v)} style={collapseBtn}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span style={{ color: '#94a3b8' }}>{'{'}</span>
        {collapsed
          ? <span style={{ color: '#6b7280', cursor: 'pointer' }} onClick={() => setCollapsed(false)}>
              {' '}{keys.length} keys{' '}
            </span>
          : (
            <div style={{ marginLeft: 16 }}>
              {keys.map((key, i) => (
                <div key={key}>
                  <span style={{ color: '#93c5fd' }}>"{key}"</span>
                  <span style={{ color: '#94a3b8' }}>: </span>
                  <JsonNode value={value[key]} indent={indent + 1} />
                  {i < keys.length - 1 && <span style={{ color: '#4b5563' }}>,</span>}
                </div>
              ))}
            </div>
          )
        }
        <span style={{ color: '#94a3b8' }}>{'}'}</span>
      </span>
    )
  }

  return <span style={{ color: '#e2e8f0' }}>{String(value)}</span>
}

const collapseBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: '#6366f1',
  fontSize: 9,
  padding: '0 3px 0 0',
  lineHeight: 1,
  verticalAlign: 'middle',
}