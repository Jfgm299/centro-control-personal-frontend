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

  const nodeLabel = node.data?.label ?? node.type ?? 'Nodo'
  const status    = data?.status
  const isSuccess = status === 'success'
  const isFailed  = status === 'failed'

  return (
    <div
      className="bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col h-full shrink-0"
      style={{ width: inline ? '100%' : 340 }}
    >

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: isSuccess ? '#22c55e' : isFailed ? '#ef4444' : 'rgba(255,255,255,0.2)',
            boxShadow: isSuccess ? '0 0 6px #22c55e' : isFailed ? '0 0 6px #ef4444' : 'none',
          }}
        />
        <span className="flex-1 text-white/85 text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
          {nodeLabel}
        </span>
        {data?.duration_ms != null && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isSuccess
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/25'
              : 'bg-red-500/15 text-red-400 border-red-400/25'
          }`}>
            {data.duration_ms}ms
          </span>
        )}
        <button
          onClick={onClose}
          className="border-none bg-transparent cursor-pointer text-white/40 hover:text-white/70 text-lg px-0.5 leading-none transition-colors"
        >
          ×
        </button>
      </div>

      {/* ── Error banner ── */}
      {isFailed && data?.error && (
        <div className="mx-3 mt-3 px-3 py-2 bg-red-500/15 border border-red-400/25 rounded-xl text-xs text-red-400 leading-relaxed">
          ❌ {data.error}
        </div>
      )}

      {/* ── Tabs ── */}
      {hasRun && (
        <>
          <div className="flex px-3 pt-2.5 gap-1 border-b border-white/10">
            {['input', 'output'].map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`px-3.5 py-1.5 rounded-t-lg border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  tab === tabKey
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {tabKey === 'input' ? 'INPUT' : 'OUTPUT'}
              </button>
            ))}
          </div>

          {/* ── JSON body ── */}
          <div className="flex-1 overflow-y-auto p-3">
            <JsonViewer data={tab === 'input' ? data.input : data.output} />
          </div>
        </>
      )}

      {!hasRun && (
        <div className="flex-1 flex items-center justify-center text-white/30 text-sm text-center p-6">
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
      <div className="text-white/30 text-xs italic p-2">
        Sin datos
      </div>
    )
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl font-mono text-xs text-green-400/80 p-3 overflow-auto leading-relaxed">
      <JsonNode value={data} indent={0} />
    </div>
  )
}

function JsonNode({ value, indent }) {
  const [collapsed, setCollapsed] = useState(false)

  if (value === null) return <span className="text-white/40">null</span>
  if (typeof value === 'boolean') return <span className="text-pink-400">{String(value)}</span>
  if (typeof value === 'number') return <span className="text-orange-400">{value}</span>
  if (typeof value === 'string') return <span className="text-green-400/80">"{value}"</span>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-white/40">[]</span>
    return (
      <span>
        <button onClick={() => setCollapsed(v => !v)} style={collapseBtn}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="text-white/40">[</span>
        {collapsed
          ? <span className="text-white/30 cursor-pointer" onClick={() => setCollapsed(false)}>
              {' '}{value.length} items{' '}
            </span>
          : (
            <div style={{ marginLeft: 16 }}>
              {value.map((item, i) => (
                <div key={i}>
                  <JsonNode value={item} indent={indent + 1} />
                  {i < value.length - 1 && <span className="text-white/20">,</span>}
                </div>
              ))}
            </div>
          )
        }
        <span className="text-white/40">]</span>
        <span className="text-white/20 text-[10px] ml-2">
          // {value.length} item{value.length !== 1 ? 's' : ''}
        </span>
      </span>
    )
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return <span className="text-white/40">{'{}'}</span>
    return (
      <span>
        <button onClick={() => setCollapsed(v => !v)} style={collapseBtn}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="text-white/40">{'{'}</span>
        {collapsed
          ? <span className="text-white/30 cursor-pointer" onClick={() => setCollapsed(false)}>
              {' '}{keys.length} keys{' '}
            </span>
          : (
            <div style={{ marginLeft: 16 }}>
              {keys.map((key, i) => (
                <div key={key}>
                  <span className="text-blue-300/80">"{key}"</span>
                  <span className="text-white/40">: </span>
                  <JsonNode value={value[key]} indent={indent + 1} />
                  {i < keys.length - 1 && <span className="text-white/20">,</span>}
                </div>
              ))}
            </div>
          )
        }
        <span className="text-white/40">{'}'}</span>
      </span>
    )
  }

  return <span className="text-white/70">{String(value)}</span>
}

const collapseBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'rgba(99,102,241,0.8)',
  fontSize: 9,
  padding: '0 3px 0 0',
  lineHeight: 1,
  verticalAlign: 'middle',
}
