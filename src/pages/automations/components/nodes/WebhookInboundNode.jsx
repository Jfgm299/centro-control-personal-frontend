import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

export default function WebhookInboundNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  return (
    <BaseNode id={id} selected={selected} minWidth={220}>
      <div onClick={() => setSelectedNodeId(id)} style={{ padding: '10px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#ecfdf5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            🔗
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.trigger')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
              {t('nodes.webhookInbound')}
            </div>
          </div>
        </div>

        {data.webhook_url && (
          <div style={{
            marginTop: 6, fontSize: 10, color: '#6b7280',
            background: '#f9fafb', borderRadius: 6, padding: '2px 6px',
            fontFamily: 'monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 180,
          }}>
            {data.webhook_url}
          </div>
        )}
      </div>

      <Handle
        type="source" position={Position.Bottom}
        style={{ background: '#059669', width: 10, height: 10, border: '2px solid #fff' }}
      />
    </BaseNode>
  )
}