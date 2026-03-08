import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

export default function StopNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  return (
    <BaseNode id={id} selected={selected} minWidth={160}>
      <Handle
        type="target" position={Position.Top}
        style={{ background: '#94a3b8', width: 10, height: 10, border: '2px solid #fff' }}
      />

      <div onClick={() => setSelectedNodeId(id)} style={{ padding: '10px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            🛑
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#dc2626', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.stop')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
              {data.config?.reason ?? t('nodes.stop')}
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  )
}