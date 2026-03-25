import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InputDataPanel from './InputDataPanel'
import NodeConfigPanel from '../config/NodeConfigPanel'
import NodeOutputPanel from './NodeOutputPanel'

/**
 * NDV — Node Details View
 *
 * Full-screen three-panel layout that REPLACES the canvas when a node is clicked.
 * Replicates n8n's node editing experience:
 *   LEFT:   INPUT data panel (previous node's output)
 *   CENTER: Node configuration (Parameters / Settings tabs)
 *   RIGHT:  OUTPUT panel (this node's execution result)
 *
 * Props:
 *   nodeId       — id of the node being edited
 *   nodes        — xyflow nodes array
 *   edges        — xyflow edges array
 *   onClose      — () => void — go back to canvas
 *   onExecuteStep — () => void — run only this node
 *   onUpdateNode — (nodeId, newData) => void
 *   onDeleteNode — (nodeId) => void
 *   variables    — available template variables
 *   automationId — for webhook URL generation
 *
 * NOTE: NodeConfigPanel receives a `noContainer` prop that will be wired up
 * in a separate task. Pass it through so the panel can strip its own outer
 * wrapper when rendered inside NDV.
 */
export default function NodeDetailsView({ nodeId, nodes, edges, onClose, onExecuteStep, onUpdateNode, onDeleteNode, variables, automationId }) {
  const { t } = useTranslation('automations')

  const node = nodes?.find(n => n.id === nodeId) ?? null
  const nodeLabel = node?.data?.label ?? node?.type ?? '...'

  return (
    <div className="flex flex-col h-full" style={{ background: 'rgba(10,12,24,0.95)' }}>

      {/* ── NDV Header ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-black/20 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
            {typeLabel(node?.type, t)}
          </div>
          <div className="text-white font-semibold text-sm truncate mt-0.5">
            {nodeLabel}
          </div>
        </div>

        {/* Execute step button */}
        <button
          onClick={onExecuteStep}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all bg-orange-500/80 hover:bg-orange-500 text-white border border-orange-400/30 active:scale-95"
        >
          <span>⚡</span>
          <span>{t('ndv.executeStep', 'Execute step')}</span>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white transition-all text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* ── Three panels ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* LEFT: INPUT */}
        <InputDataPanel nodeId={nodeId} nodes={nodes} edges={edges} />

        {/* CENTER: Config — takes remaining space */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-white/10">
          <ConfigTabsPanel
            node={node}
            onUpdate={onUpdateNode}
            onDelete={onDeleteNode}
            variables={variables}
            automationId={automationId}
            t={t}
          />
        </div>

        {/* RIGHT: OUTPUT */}
        <div style={{ width: 280, flexShrink: 0 }} className="flex flex-col h-full">
          <NodeOutputPanel node={node} onClose={() => {}} inline ndv />
        </div>
      </div>
    </div>
  )
}

// ── Center panel with Parameters / Settings tabs ──────────────────────────────

function ConfigTabsPanel({ node, onUpdate, onDelete, variables, automationId, t }) {
  const [tab, setTab] = useState('parameters')

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0 bg-white/[0.02]">
        {['parameters', 'settings'].map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-5 py-2.5 text-xs font-semibold capitalize transition-all ${
              tab === tabKey
                ? 'text-white border-b-2 border-white/70 bg-white/5'
                : 'text-white/35 hover:text-white/60 border-b-2 border-transparent'
            }`}
          >
            {t(`ndv.${tabKey}`, tabKey.charAt(0).toUpperCase() + tabKey.slice(1))}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'parameters' ? (
          <NodeConfigPanel
            node={node}
            onUpdate={onUpdate}
            onDelete={onDelete}
            variables={variables}
            automationId={automationId}
            noContainer
          />
        ) : (
          <SettingsPanel node={node} onUpdate={onUpdate} t={t} />
        )}
      </div>
    </>
  )
}

// ── Settings panel ────────────────────────────────────────────────────────────

function SettingsPanel({ node, onUpdate, t }) {
  if (!node) return null
  const config = node.data ?? {}

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Continue on error — action nodes only */}
      {node.type === 'action' && (
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 accent-orange-400 cursor-pointer"
            checked={config.continue_on_error ?? false}
            onChange={e => onUpdate(node.id, { continue_on_error: e.target.checked })}
          />
          <div>
            <div className="text-white/75 text-sm font-medium group-hover:text-white transition-colors">
              {t('ndv.continueOnError', 'Continue on error')}
            </div>
            <div className="text-white/35 text-xs mt-0.5">
              {t('ndv.continueOnErrorDesc', 'Flow continues even if this step fails')}
            </div>
          </div>
        </label>
      )}

      {/* Notes */}
      <div>
        <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">
          {t('ndv.notes', 'Notes')}
        </label>
        <textarea
          value={config.notes ?? ''}
          onChange={e => onUpdate(node.id, { notes: e.target.value })}
          placeholder={t('ndv.notesPlaceholder', 'Notes about this node...')}
          rows={4}
          className="w-full px-3 py-2.5 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/15 transition-all resize-none"
        />
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function typeLabel(type, t) {
  const map = {
    trigger:          t('nodes.trigger'),
    action:           t('nodes.action'),
    condition:        t('nodes.condition'),
    delay:            t('nodes.delay'),
    webhook_inbound:  t('nodes.webhookInbound'),
    outbound_webhook: t('nodes.webhookOutbound'),
    stop:             t('nodes.stop'),
  }
  return map[type] ?? type ?? ''
}
