import { useState } from 'react'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * Panel derecho al estilo n8n que aparece al hacer click en un nodo
 * que tiene datos de ejecución. Muestra Input / Output en JSON viewer.
 *
 * Props:
 *   node     — nodo seleccionado
 *   onClose  — callback para cerrar
 *   inline   — boolean, legacy prop (usa width 100% en vez de 340px)
 *   ndv      — boolean, cuando true adapta el panel al layout NDV:
 *              - width: '100%' (el NDV controla el ancho)
 *              - Header simplificado: label "OUTPUT" + indicador de estado
 *              - Tabs Schema / Table / JSON en vez de Input / Output
 */
export default function NodeOutputPanel({ node, onClose, inline = false, ndv = false }) {
  const nodeOutputData  = useAutomationsStore((s) => s.nodeOutputData)
  const lastResult      = useAutomationsStore((s) => s.lastExecutionResult)  // eslint-disable-line no-unused-vars

  const [tab, setTab]       = useState('output')
  const [ndvTab, setNdvTab] = useState('schema')

  if (!node) return null

  const data   = nodeOutputData[node.id]
  const hasRun = !!data

  const nodeLabel = node.data?.label ?? node.type ?? 'Nodo'
  const status    = data?.status
  const isSuccess = status === 'success'
  const isFailed  = status === 'failed'

  // ── NDV mode ──────────────────────────────────────────────────────────────
  if (ndv) {
    const outputData = data?.output ?? null

    return (
      <div
        className="bg-black/20 backdrop-blur-xl flex flex-col h-full shrink-0"
        style={{ width: '100%' }}
      >
        {/* OUTPUT header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 flex-shrink-0 bg-white/5">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">OUTPUT</span>
          {hasRun && (
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isSuccess ? '#22c55e' : '#ef4444',
                boxShadow: isSuccess ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
              }}
            />
          )}
        </div>

        {/* Error banner */}
        {isFailed && data?.error && (
          <div className="mx-3 mt-3 px-3 py-2 bg-red-500/15 border border-red-400/25 rounded-xl text-xs text-red-400 leading-relaxed flex-shrink-0">
            ❌ {data.error}
          </div>
        )}

        {hasRun ? (
          <>
            {/* Schema / Table / JSON tabs */}
            <div className="flex px-3 pt-2.5 gap-1 border-b border-white/10 flex-shrink-0">
              {['schema', 'table', 'json'].map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setNdvTab(tabKey)}
                  className={`px-3.5 py-1.5 rounded-t-lg border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                    ndvTab === tabKey
                      ? 'bg-white/15 border-white/40 text-white'
                      : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {tabKey === 'schema' ? 'Schema' : tabKey === 'table' ? 'Table' : 'JSON'}
                </button>
              ))}
            </div>

            {/* Tab body */}
            <div className="flex-1 overflow-y-auto">
              {ndvTab === 'schema' && (
                <div className="py-2">
                  {outputData !== null && outputData !== undefined ? (
                    <OutputFieldTree data={outputData} path="" depth={0} />
                  ) : (
                    <p className="text-white/30 text-sm text-center py-8 px-4">Sin output</p>
                  )}
                </div>
              )}

              {ndvTab === 'table' && (
                <OutputTableView data={outputData} />
              )}

              {ndvTab === 'json' && (
                <div className="p-3">
                  <JsonViewer data={outputData} />
                </div>
              )}
            </div>

            {/* Duration badge */}
            {data?.duration_ms != null && (
              <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isSuccess
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/25'
                    : 'bg-red-500/15 text-red-400 border-red-400/25'
                }`}>
                  {data.duration_ms}ms
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm text-center p-6 gap-3">
            <span className="text-3xl opacity-40">→</span>
            <span>Ejecuta el flujo<br />para ver el output</span>
          </div>
        )}
      </div>
    )
  }

  // ── Default mode (existing behavior) ─────────────────────────────────────
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


// ── Output Schema (FieldTree) ─────────────────────────────────────────────────

function OutputFieldTree({ data, path, depth }) {
  if (data === null || data === undefined) return null

  if (Array.isArray(data)) {
    return (
      <>
        {data.map((item, idx) => {
          const childPath = path ? `${path}.${idx}` : String(idx)
          return <OutputFieldRow key={idx} fieldKey={String(idx)} value={item} path={childPath} depth={depth} />
        })}
      </>
    )
  }

  if (typeof data === 'object') {
    return (
      <>
        {Object.entries(data).map(([key, value]) => {
          const childPath = path ? `${path}.${key}` : key
          return <OutputFieldRow key={key} fieldKey={key} value={value} path={childPath} depth={depth} />
        })}
      </>
    )
  }

  return null
}

function OutputFieldRow({ fieldKey, value, path, depth }) {
  const [expanded, setExpanded] = useState(false)
  const isExpandable = value !== null && typeof value === 'object'
  const indentPx     = depth * 12

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('variable', path)
  }

  if (isExpandable) {
    return (
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 w-full text-left transition-all"
          style={{ paddingLeft: `${12 + indentPx}px` }}
        >
          <span className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 text-xs select-none">
            {expanded ? '▾' : '▸'}
          </span>
          <span className="text-white/70 text-sm font-mono truncate flex-1">{fieldKey}</span>
          <span className="text-purple-400/70 text-xs font-mono flex-shrink-0">
            {Array.isArray(value) ? `[${value.length}]` : '{…}'}
          </span>
        </button>
        {expanded && (
          <OutputFieldTree data={value} path={path} depth={depth + 1} />
        )}
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 cursor-grab active:cursor-grabbing transition-all"
      style={{ paddingLeft: `${12 + indentPx}px` }}
    >
      <span className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 text-xs select-none">
        ⠿
      </span>
      <span className="text-white/70 text-sm font-mono truncate flex-1">{fieldKey}</span>
      <span className={`text-xs font-mono truncate max-w-[80px] flex-shrink-0 ${outputValueColorClass(value)}`}>
        {outputFormatPreview(value)}
      </span>
    </div>
  )
}

function outputValueColorClass(value) {
  if (value === null)             return 'text-red-400/70'
  if (typeof value === 'string')  return 'text-emerald-400/70'
  if (typeof value === 'number')  return 'text-blue-400/70'
  if (typeof value === 'boolean') return 'text-orange-400/70'
  return 'text-purple-400/70'
}

function outputFormatPreview(value) {
  if (value === null)             return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number')  return String(value)
  if (typeof value === 'string') {
    const truncated = value.length > 18 ? value.slice(0, 18) + '…' : value
    return `"${truncated}"`
  }
  return ''
}

// ── Output Table View ─────────────────────────────────────────────────────────

function OutputTableView({ data }) {
  if (data === null || data === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-white/30 text-sm text-center">Sin output</p>
      </div>
    )
  }

  // Flatten first level only — key/value pairs
  const entries = typeof data === 'object' && !Array.isArray(data)
    ? Object.entries(data)
    : Array.isArray(data)
      ? data.map((v, i) => [String(i), v])
      : [['value', data]]

  return (
    <div className="p-3">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-white/40 font-semibold uppercase tracking-wider py-2 px-2 w-2/5">Key</th>
            <th className="text-left text-white/40 font-semibold uppercase tracking-wider py-2 px-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-2 px-2 font-mono text-white/70 truncate max-w-0">{key}</td>
              <td className={`py-2 px-2 font-mono truncate max-w-0 ${outputValueColorClass(value)}`}>
                {typeof value === 'object' && value !== null
                  ? Array.isArray(value) ? `[${value.length} items]` : `{${Object.keys(value).length} keys}`
                  : outputFormatPreview(value)
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
