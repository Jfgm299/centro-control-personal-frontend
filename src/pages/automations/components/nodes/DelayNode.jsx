import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

export default function DelayNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const { delay_value, delay_unit } = data.config ?? {}
  const summary = delay_value
    ? `${delay_value} ${t(`delay.${delay_unit ?? 'minutes'}`)}`
    : null

  return (
    <BaseNode id={id} selected={selected} minWidth={180}>
      <Handle
        type="target" position={Position.Top}
        style={{ background: '#94a3b8', width: 10, height: 10, border: '2px solid #fff' }}
      />

      <div onClick={() => setSelectedNodeId(id)} style={{ padding: '10px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.delay')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.90)' }}>
              {summary ? `${t('delay.label')} ${summary}` : t('nodes.delay')}
            </div>
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