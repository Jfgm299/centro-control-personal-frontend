import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style delay node with rounded corners.
 * Pauses execution for a specified duration.
 */
function N8nDelayNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const { delay_value, delay_unit } = data.config ?? {}
  const summary = delay_value
    ? `${delay_value} ${t(`delay.${delay_unit ?? 'minutes'}`)}`
    : null
  const title = summary ? `${t('delay.label')} ${summary}` : t('nodes.delay')

  return (
    <N8nBaseNode
      id={id}
      selected={selected}
      category="delay"
      minWidth={180}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle node-handle--delay"
      />

      <div
        onClick={() => setSelectedNodeId(id)}
        className="node-content"
        style={{ cursor: 'pointer' }}
      >
        <div className="node-icon-badge node-icon-badge--delay">
          ⏳
        </div>
        <div className="node-text">
          <div className="node-label node-label--delay">
            {t('nodes.delay')}
          </div>
          <div className="node-title">{title}</div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle node-handle--delay"
      />
    </N8nBaseNode>
  )
}

export default memo(N8nDelayNode)
