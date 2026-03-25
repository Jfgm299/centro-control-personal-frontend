import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style condition node with diamond-hint shape.
 * Has one input and two outputs (true/false branches).
 */
function N8nConditionNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const { field, operator, value } = data.config ?? {}
  const hasConfig = field && operator
  const title = hasConfig
    ? `${field} ${operator} ${value ?? ''}`
    : t('nodes.condition')

  return (
    <N8nBaseNode
      id={id}
      selected={selected}
      category="condition"
      minWidth={220}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle node-handle--condition"
      />

      <div
        onClick={() => setSelectedNodeId(id)}
        className="node-content"
        style={{ cursor: 'pointer' }}
      >
        <div className="node-icon-badge node-icon-badge--condition">
          🔀
        </div>
        <div className="node-text">
          <div className="node-label node-label--condition">
            {t('nodes.condition')}
          </div>
          <div className="node-title">{title}</div>
        </div>
      </div>

      {/* Branch labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px 10px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#15803d' }}>
            {t('condition.true')}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626' }}>
            {t('condition.false')}
          </span>
        </div>
      </div>

      {/* True output handle (left) */}
      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        className="node-handle"
        style={{
          left: '30%',
          background: 'var(--edge-true)',
        }}
      />

      {/* False output handle (right) */}
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        className="node-handle"
        style={{
          left: '70%',
          background: 'var(--edge-false)',
        }}
      />
    </N8nBaseNode>
  )
}

export default memo(N8nConditionNode)
