import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style stop node with pill-right shape.
 * Terminal node - ends workflow execution.
 */
function N8nStopNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const title = data.config?.reason ?? t('nodes.stop')

  return (
    <N8nBaseNode
      id={id}
      selected={selected}
      category="stop"
      minWidth={160}
    >
      {/* Input handle only - no output */}
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle node-handle--stop"
      />

      <div
        onClick={() => setSelectedNodeId(id)}
        className="node-content"
        style={{ cursor: 'pointer' }}
      >
        <div className="node-icon-badge node-icon-badge--stop">
          🛑
        </div>
        <div className="node-text">
          <div className="node-label node-label--stop">
            {t('nodes.stop')}
          </div>
          <div className="node-title">{title}</div>
        </div>
      </div>
    </N8nBaseNode>
  )
}

export default memo(N8nStopNode)
