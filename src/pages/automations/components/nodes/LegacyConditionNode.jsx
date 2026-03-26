import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

export default function ConditionNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const { field, operator, value } = data.config ?? {}
  const hasConfig = field && operator

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hasConfig ? 8 : 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            🔀
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#d97706', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.condition')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.90)', lineHeight: 1.2 }}>
              {hasConfig
                ? `${field} ${operator} ${value ?? ''}`
                : t('nodes.condition')}
            </div>
          </div>
        </div>
      </div>

      {/* Dos handles de salida: true (izquierda) y false (derecha) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
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

      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        style={{
          left: '30%', background: '#22c55e',
          width: 10, height: 10, border: '2px solid #fff',
        }}
      />
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        style={{
          left: '70%', background: '#ef4444',
          width: 10, height: 10, border: '2px solid #fff',
        }}
      />
    </BaseNode>
  )
}