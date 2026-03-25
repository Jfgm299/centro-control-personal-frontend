import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import { useReactFlow } from '@xyflow/react'
import { useAutomationsStore } from '../../store/editorStore'
import FloatingPanel from '../ui/FloatingPanel'
import NodeConfigPanel from '../config/NodeConfigPanel'
import InputDataPanel from '../editor/InputDataPanel'
import NodeOutputPanel from '../editor/NodeOutputPanel'

/**
 * FloatingNDV — Floating Node Details View
 *
 * A floating panel version of the NDV that appears near the selected node.
 * Unlike the legacy NDV which replaces the canvas, this floats OVER it.
 *
 * Features:
 * - Auto-opens when a node is selected
 * - Positions near the selected node (prefers right side)
 * - Three-column layout: INPUT | Parameters | OUTPUT (n8n-style)
 * - Closes with ESC key or close button
 * - Can be collapsed, dragged, and resized
 *
 * Props:
 *   nodes        — xyflow nodes array
 *   edges        — xyflow edges array
 *   onUpdateNode — (nodeId, newData) => void
 *   onDeleteNode — (nodeId) => void
 *   onExecuteStep — () => void — run only this node
 *   variables    — available template variables
 *   automationId — for webhook URL generation
 */
export default function FloatingNDV({
  nodes,
  edges,
  onUpdateNode,
  onDeleteNode,
  onExecuteStep,
  variables,
  automationId,
}) {
  const { t } = useTranslation('automations')
  const { getViewport, getNode } = useReactFlow()

  // Store state
  const selectedNodeId = useAutomationsStore((s) => s.selectedNodeId)
  const ndvPanel = useAutomationsStore((s) => s.panels.ndv)
  const openPanel = useAutomationsStore((s) => s.openPanel)
  const closePanel = useAutomationsStore((s) => s.closePanel)
  const setPanelPosition = useAutomationsStore((s) => s.setPanelPosition)

  // Center tab state
  const [centerTab, setCenterTab] = useState('parameters')

  // Get selected node data
  const node = useMemo(
    () => nodes?.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  )

  // Track if we've positioned for this node (to avoid re-positioning on every render)
  const positionedForNodeRef = useRef(null)
  const previousSelectedNodeRef = useRef(null)

  // Close handler - defined early so ESC effect can use it
  const handleClose = useCallback(() => {
    closePanel('ndv')
  }, [closePanel])

  // Auto-open NDV only when selected node changes.
  // This lets users close it and keep it closed for the current node.
  useEffect(() => {
    const selectedChanged = selectedNodeId !== previousSelectedNodeRef.current
    if (!selectedChanged) return

    previousSelectedNodeRef.current = selectedNodeId ?? null
    positionedForNodeRef.current = null

    if (selectedNodeId) {
      openPanel('ndv')
    }
  }, [selectedNodeId, openPanel])

  // Position NDV near selected node when it opens
  useEffect(() => {
    if (!selectedNodeId || !ndvPanel?.open) return
    if (positionedForNodeRef.current === selectedNodeId) return // Already positioned

    const xyNode = getNode(selectedNodeId)
    if (!xyNode) return

    const viewport = getViewport()
    const panelWidth = ndvPanel?.size?.w ?? 900
    const panelHeight = ndvPanel?.size?.h ?? 580

    // Get the parent container bounds
    const container = document.querySelector('.react-flow')
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    // Node position in screen coordinates
    const nodeScreenX = xyNode.position.x * viewport.zoom + viewport.x
    const nodeScreenY = xyNode.position.y * viewport.zoom + viewport.y
    const nodeWidth = (xyNode.width ?? 200) * viewport.zoom

    // Center horizontally and vertically in the canvas
    const x = Math.max(16, (containerRect.width - panelWidth) / 2)
    const y = Math.max(16, (containerRect.height - panelHeight) / 2)

    setPanelPosition('ndv', { x, y })
    positionedForNodeRef.current = selectedNodeId
  }, [selectedNodeId, ndvPanel?.open, ndvPanel?.size, getNode, getViewport, setPanelPosition])

  // Reset positioned ref when node changes
  useEffect(() => {
    if (!selectedNodeId) {
      positionedForNodeRef.current = null
    }
  }, [selectedNodeId])

  // Handle ESC key to close
  useEffect(() => {
    if (!ndvPanel?.open) return

    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ndvPanel?.open, handleClose])

  // Close when clicking outside of the NDV panel
  useEffect(() => {
    if (!ndvPanel?.open) return

    const handler = (e) => {
      // Don't close if clicking inside ANY floating panel
      if (e.target.closest('.floating-panel')) return
      handleClose()
    }

    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [ndvPanel?.open, handleClose])

  const isOpen = selectedNodeId && ndvPanel?.open && node
  const nodeLabel = node?.data?.label ?? node?.type ?? '...'

  return (
    <AnimatePresence>
      {isOpen && (
        <FloatingPanel
          id="ndv"
          title={nodeLabel}
          defaultWidth={Math.round(window.innerWidth * 0.88)}
          defaultHeight={Math.round(window.innerHeight * 0.78)}
          minWidth={700}
          minHeight={500}
          collapsible
          resizable
          onClose={handleClose}
          className="floating-ndv"
          headerActions={
            <button
              onClick={onExecuteStep}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-all bg-orange-500/60 hover:bg-orange-500/80 text-white border border-orange-400/30 active:scale-95"
              title={t('ndv.executeStep', 'Execute step')}
            >
              <span>⚡</span>
            </button>
          }
        >
          {/* 3-column unified body */}
          <div className="ndv-unified-body">

            {/* LEFT: INPUT column */}
            <div className="ndv-col ndv-col--side ndv-col--left">
              <div className="ndv-col-body ndv-col-body--padded">
                <InputDataPanel
                  nodeId={selectedNodeId}
                  nodes={nodes}
                  edges={edges}
                  compact
                />
              </div>
            </div>

            {/* CENTER: Parameters column */}
            <div className="ndv-col ndv-col--center">
              <div className="ndv-center-tabs">
                <button
                  className={`ndv-center-tab${centerTab === 'parameters' ? ' active' : ''}`}
                  onClick={() => setCenterTab('parameters')}
                >
                  {t('ndv.parameters', 'Parameters')}
                </button>
              </div>
              <div className="ndv-col-body ndv-col-body--padded">
                <NodeConfigPanel
                  node={node}
                  onUpdate={onUpdateNode}
                  onDelete={onDeleteNode}
                  variables={variables}
                  automationId={automationId}
                  noContainer
                />
              </div>
            </div>

            {/* RIGHT: OUTPUT column */}
            <div className="ndv-col ndv-col--side ndv-col--right">
              <div className="ndv-col-body ndv-col-body--padded">
                <NodeOutputPanel node={node} onClose={() => {}} inline ndv compact />
              </div>
            </div>

          </div>
        </FloatingPanel>
      )}
    </AnimatePresence>
  )
}
