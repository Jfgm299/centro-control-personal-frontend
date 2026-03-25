import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

export default function OutboundWebhookNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const url    = data.config?.url ?? null
  const method = data.config?.method ?? 'POST'
  const label  = data.label ?? t('nodes.outbound_webhook', 'HTTP Request')

  return (
    <BaseNode id={id} selected={selected} minWidth={220}>
      <Handle
        type="target" position={Position.Top}
        style={{ background: '#94a3b8', width: 10, height: 10, border: '2px solid #fff' }}
      />

      <div onClick={() => setSelectedNodeId(id)} style={{ padding: '10px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(234,88,12,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            🌐
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#ea580c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.webhookOutbound', 'HTTP Request')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.90)', lineHeight: 1.2 }}>
              {label}
            </div>
            {url && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                {method} {url}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source" position={Position.Bottom}
        style={{ background: '#94a3b8', width: 10, height: 10, border: '2px solid #fff' }}
      />
    </BaseNode>
  )
}