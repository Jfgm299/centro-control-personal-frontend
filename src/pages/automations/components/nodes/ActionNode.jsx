import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

export default function ActionNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const label = data.label ?? t('nodes.action')
  const icon  = data.icon  ?? '⚙️'

  return (
    <BaseNode id={id} selected={selected} minWidth={220}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#94a3b8', width: 10, height: 10, border: '2px solid #fff' }}
      />

      <div
        onClick={() => setSelectedNodeId(id)}
        style={{ padding: '10px 14px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.action')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
              {label}
            </div>
          </div>
        </div>

        {data.continue_on_error && (
          <div style={{ marginTop: 6, fontSize: 10, color: '#f59e0b', fontWeight: 500 }}>
            ⚠️ Continúa si hay error
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#94a3b8', width: 10, height: 10, border: '2px solid #fff' }}
      />
    </BaseNode>
  )
}