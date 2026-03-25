import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import BaseNode from './BaseNode'
import { useAutomationsStore } from '../../store/editorStore'

const TRIGGER_ICONS = {
  'system.manual':            '▶️',
  'system.schedule_once':     '🕐',
  'system.schedule_interval': '🔁',
  'system.webhook_inbound':   '🔗',
}

export default function TriggerNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const icon  = TRIGGER_ICONS[data.ref_id] ?? '⚡'
  const label = data.label ?? t('nodes.trigger')

  return (
    <BaseNode id={id} selected={selected} minWidth={220}>
      <div
        onClick={() => setSelectedNodeId(id)}
        style={{ padding: '10px 14px', cursor: 'pointer' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(34,197,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('nodes.trigger')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.90)', lineHeight: 1.2 }}>
              {label}
            </div>
          </div>
        </div>

        {/* Subtítulo config resumida */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.45)',
            background: 'rgba(255,255,255,0.06)', borderRadius: 6,
            padding: '3px 8px', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {summarizeConfig(data.config, t)}
          </div>
        )}
      </div>

      {/* Solo handle de salida */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#22c55e', width: 10, height: 10, border: '2px solid #fff' }}
      />
    </BaseNode>
  )
}

function summarizeConfig(config, t) {
  if (config.interval_value && config.interval_unit) {
    return `${t('schedule.every')} ${config.interval_value} ${config.interval_unit}`
  }
  if (config.run_at) {
    return new Date(config.run_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }
  return null
}