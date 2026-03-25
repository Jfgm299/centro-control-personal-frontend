import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore, getPrevNodeId } from '../../store/editorStore'

export default function PrevNodeOutputPanel({ nodeId, nodes, edges }) {
  const { t } = useTranslation('automations')
  const nodeOutputData = useAutomationsStore((s) => s.nodeOutputData)

  const prevNodeId = getPrevNodeId(nodeId, nodes, edges)
  const prevNode   = nodes?.find(n => n.id === prevNodeId) ?? null

  if (!prevNode) {
    return (
      <div className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col h-full overflow-hidden" style={{ width: 220, flexShrink: 0 }}>
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            {t('prevNode.title')}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm text-center py-8 px-4">
            {t('prevNode.noParent')}
          </p>
        </div>
      </div>
    )
  }

  const prevOutput = nodeOutputData[prevNodeId]
  const outputData = prevOutput?.output ?? prevOutput?.input ?? null
  const nodeLabel  = prevNode.data?.label ?? prevNodeId
  const nodeType   = prevNode.type ?? ''

  return (
    <div className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col h-full overflow-hidden" style={{ width: 220, flexShrink: 0 }}>

      {/* Header */}
      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider flex-shrink-0">
            {t('prevNode.title')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/85 text-sm font-medium truncate flex-1">{nodeLabel}</span>
          {nodeType && (
            <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full border border-white/10 flex-shrink-0">
              {nodeType}
            </span>
          )}
        </div>
        {outputData && (
          <p className="text-white/30 text-xs mt-1.5">{t('prevNode.dragHint')}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {outputData ? (
          <FieldTree data={outputData} path="" depth={0} />
        ) : (
          <p className="text-white/30 text-sm text-center py-8 px-4">
            {t('prevNode.empty')}
          </p>
        )}
      </div>

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
          <FieldTree data={value} path={path} depth={depth + 1} />
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
      {/* Drag handle icon */}
      <span className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 text-xs select-none">
        ⠿
      </span>

      {/* Key */}
      <span className="text-white/70 text-sm font-mono truncate flex-1">{fieldKey}</span>

      {/* Value preview */}
      <span className={`text-xs font-mono truncate max-w-[80px] flex-shrink-0 ${valueColorClass(value)}`}>
        {formatPreview(value)}
      </span>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function valueColorClass(value) {
  if (value === null)                return 'text-red-400/70'
  if (typeof value === 'string')     return 'text-emerald-400/70'
  if (typeof value === 'number')     return 'text-blue-400/70'
  if (typeof value === 'boolean')    return 'text-orange-400/70'
  return 'text-purple-400/70'
}

function formatPreview(value) {
  if (value === null)             return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number')  return String(value)
  if (typeof value === 'string') {
    const truncated = value.length > 18 ? value.slice(0, 18) + '…' : value
    return `"${truncated}"`
  }
  return ''
}
