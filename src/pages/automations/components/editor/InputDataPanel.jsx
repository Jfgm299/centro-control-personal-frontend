import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore, getPrevNodeId } from '../../store/editorStore'

export default function InputDataPanel({ nodeId, nodes, edges }) {
  const { t } = useTranslation('automations')
  const nodeOutputData = useAutomationsStore(s => s.nodeOutputData)
  const [tab, setTab] = useState('schema') // 'schema' | 'table' | 'json'

  const prevNodeId = getPrevNodeId(nodeId, nodes, edges)
  const prevNode = nodes?.find(n => n.id === prevNodeId) ?? null
  const prevOutput = nodeOutputData[prevNodeId]
  const outputData = prevOutput?.output ?? prevOutput?.input ?? null

  return (
    <div style={{ width: 280, flexShrink: 0 }} className="flex flex-col h-full border-r border-white/10 bg-[#111827]/80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 flex-shrink-0 bg-white/5">
        <span className="text-white/50 text-xs font-bold uppercase tracking-widest">
          {t('ndv.input', 'INPUT')}
        </span>
        {/* Search icon (decorative for now) */}
        <button className="text-white/30 hover:text-white/60 transition-colors text-sm">🔍</button>
      </div>

      {/* Tabs: Schema / Table / JSON */}
      <div className="flex border-b border-white/10 flex-shrink-0 bg-white/[0.02]">
        {['schema', 'table', 'json'].map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 py-2 text-xs font-semibold capitalize transition-all ${
              tab === tabKey
                ? 'text-white border-b-2 border-white/70 bg-white/5'
                : 'text-white/35 hover:text-white/60 border-b-2 border-transparent'
            }`}
          >
            {t(`ndv.${tabKey}`, tabKey.charAt(0).toUpperCase() + tabKey.slice(1))}
          </button>
        ))}
      </div>

      {/* If no prev node */}
      {!prevNode && (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-white/25 text-xs text-center leading-relaxed">
            {t('ndv.noInput', 'No input data for this node')}
          </p>
        </div>
      )}

      {/* If prev node exists but no execution data yet */}
      {prevNode && !outputData && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
          <span className="text-3xl opacity-30">→</span>
          <p className="text-white/25 text-xs text-center leading-relaxed">
            {t('ndv.noOutputHint', 'Run this step to see output')}
          </p>
          {/* Show node name */}
          <div className="mt-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-white/40 text-xs">{prevNode.data?.label ?? prevNode.type}</span>
          </div>
        </div>
      )}

      {/* Data available */}
      {prevNode && outputData && (
        <>
          {/* Prev node indicator */}
          <div className="px-3 py-2 border-b border-white/[0.08] flex items-center gap-2 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 flex-shrink-0" />
            <span className="text-white/50 text-xs truncate">{prevNode.data?.label ?? prevNode.type}</span>
            <span className="ml-auto text-white/25 text-xs">1 item</span>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'schema' && (
              <div className="py-1">
                <FieldTree data={outputData} path="" depth={0} />
              </div>
            )}
            {tab === 'table' && (
              <TableView data={outputData} />
            )}
            {tab === 'json' && (
              <div className="p-3">
                <pre className="bg-black/40 border border-white/10 rounded-xl font-mono text-[11px] text-green-400/80 p-3 overflow-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(outputData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Drag hint */}
          <div className="px-3 py-2 border-t border-white/[0.08] flex-shrink-0">
            <p className="text-white/20 text-[10px] text-center">{t('ndv.dragHint', 'Drag fields to config inputs')}</p>
          </div>
        </>
      )}
    </div>
  )
}

// ── Table view — first level key/value ────────────────────────────────────────

function TableView({ data }) {
  if (!data || typeof data !== 'object') return (
    <div className="p-4 text-white/30 text-xs text-center">No table data</div>
  )
  const entries = Object.entries(data)
  return (
    <div className="divide-y divide-white/5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-start gap-2 px-3 py-2 hover:bg-white/5 transition-colors">
          <span className="text-white/60 text-xs font-mono flex-shrink-0 w-[80px] truncate">{key}</span>
          <span className={`text-xs font-mono truncate flex-1 ${valueColorClass(value)}`}>
            {formatPreview(value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Recursive field tree ──────────────────────────────────────────────────────

function FieldTree({ data, path, depth }) {
  if (data === null || data === undefined) return null

  if (Array.isArray(data)) {
    return (
      <>
        {data.map((item, idx) => {
          const childPath = path ? `${path}.${idx}` : String(idx)
          return <FieldRow key={idx} fieldKey={String(idx)} value={item} path={childPath} depth={depth} />
        })}
      </>
    )
  }

  if (typeof data === 'object') {
    return (
      <>
        {Object.entries(data).map(([key, value]) => {
          const childPath = path ? `${path}.${key}` : key
          return <FieldRow key={key} fieldKey={key} value={value} path={childPath} depth={depth} />
        })}
      </>
    )
  }

  return null
}

function FieldRow({ fieldKey, value, path, depth }) {
  const [expanded, setExpanded] = useState(false)
  const isExpandable = value !== null && typeof value === 'object'
  const indentPx = depth * 14

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('variable', path)
  }

  // Type indicator
  const typeIndicator = getTypeIndicator(value)

  if (isExpandable) {
    const count = Array.isArray(value) ? value.length : Object.keys(value).length
    return (
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 w-full px-3 py-1.5 hover:bg-white/5 text-left transition-colors"
          style={{ paddingLeft: `${12 + indentPx}px` }}
        >
          <span className="text-white/30 text-[10px] w-3 flex-shrink-0 select-none">
            {expanded ? '▾' : '▸'}
          </span>
          <span className="text-white/50 text-[10px] font-bold mr-1 flex-shrink-0">{typeIndicator}</span>
          <span className="text-white/75 text-xs font-mono truncate flex-1">{fieldKey}</span>
          <span className="text-purple-400/60 text-[10px] font-mono flex-shrink-0">
            {Array.isArray(value) ? `[${count}]` : `{${count}}`}
          </span>
        </button>
        {expanded && <FieldTree data={value} path={path} depth={depth + 1} />}
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors"
      style={{ paddingLeft: `${12 + indentPx}px` }}
    >
      {/* Drag dots */}
      <span className="text-white/15 group-hover:text-white/40 transition-colors text-[10px] flex-shrink-0 select-none w-3">⠿</span>
      {/* Type */}
      <span className="text-white/40 text-[10px] font-bold flex-shrink-0 w-3">{typeIndicator}</span>
      {/* Key */}
      <span className="text-white/75 text-xs font-mono truncate flex-1">{fieldKey}</span>
      {/* Value preview */}
      <span className={`text-[11px] font-mono truncate max-w-[90px] flex-shrink-0 ${valueColorClass(value)}`}>
        {formatPreview(value)}
      </span>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTypeIndicator(value) {
  if (value === null) return 'N'
  if (typeof value === 'string') return 'T'
  if (typeof value === 'number') return '#'
  if (typeof value === 'boolean') return 'B'
  if (Array.isArray(value)) return '[]'
  return '{}'
}

function valueColorClass(value) {
  if (value === null) return 'text-red-400/60'
  if (typeof value === 'string') return 'text-emerald-400/70'
  if (typeof value === 'number') return 'text-blue-400/70'
  if (typeof value === 'boolean') return 'text-orange-400/70'
  return 'text-purple-400/70'
}

function formatPreview(value) {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const t = value.length > 20 ? value.slice(0, 20) + '…' : value
    return `"${t}"`
  }
  return ''
}
