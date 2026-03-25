import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style outbound webhook action node.
 * Makes HTTP requests to external services.
 */
function N8nOutboundWebhookNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const url = data.config?.url ?? null
  const method = data.config?.method ?? 'POST'
  const label = data.label ?? t('nodes.outbound_webhook', 'HTTP Request')

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
          🌐
        </div>
        <div className="node-text">
          <div className="node-label node-label--action">
            {t('nodes.webhookOutbound', 'HTTP Request')}
          </div>
          <div className="node-title">{label}</div>
          {url && (
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.40)',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 160,
            }}>
              {method} {url}
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

export default memo(N8nOutboundWebhookNode)
