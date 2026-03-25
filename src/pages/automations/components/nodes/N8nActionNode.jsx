import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style action node with fully rounded corners.
 * Generic action execution node with input and output handles.
 */
function N8nActionNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const icon = data.icon ?? '⚙️'
  const title = data.ref_id ? t(`registry.nodes.${data.ref_id}`, { defaultValue: data.label ?? t('nodes.action') }) : (data.label ?? t('nodes.action'))

  return (
    <N8nBaseNode
      id={id}
      selected={selected}
      category="action"
      minWidth={220}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle node-handle--action"
      />

      <div
        onClick={() => setSelectedNodeId(id)}
        className="node-content"
        style={{ cursor: 'pointer' }}
      >
        <div className="node-icon-badge node-icon-badge--action">
          {icon}
        </div>
        <div className="node-text">
          <div className="node-label node-label--action">
            {t('nodes.action')}
          </div>
          <div className="node-title">{title}</div>
          {data.continue_on_error && (
            <div style={{ 
              marginTop: 4, 
              fontSize: 10, 
              color: '#f59e0b', 
              fontWeight: 500 
            }}>
              {t('nodes.continueOnError')}
            </div>
          )}
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle node-handle--action"
      />
    </N8nBaseNode>
  )
}

export default memo(N8nActionNode)
