import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style webhook inbound trigger node.
 * Receives external HTTP requests to trigger workflow.
 */
function N8nWebhookInboundNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  return (
    <N8nBaseNode
      id={id}
      selected={selected}
      category="trigger"
      minWidth={220}
    >
      <div
        onClick={() => setSelectedNodeId(id)}
        className="node-content"
        style={{ cursor: 'pointer' }}
      >
        <div className="node-icon-badge node-icon-badge--trigger">
          🔗
        </div>
        <div className="node-text">
          <div className="node-label node-label--trigger">
            {t('nodes.trigger')}
          </div>
          <div className="node-title">{t('nodes.webhookInbound')}</div>
          {data.webhook_url && (
            <div style={{
              marginTop: 4,
              fontSize: 10,
              color: 'rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 6,
              padding: '2px 6px',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 180,
            }}>
              {data.webhook_url}
            </div>
          )}
        </div>
      </div>

      {/* Output handle only - trigger nodes don't have inputs */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle node-handle--trigger"
      />
    </N8nBaseNode>
  )
}

export default memo(N8nWebhookInboundNode)
