import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import N8nBaseNode from './N8nBaseNode'
import { useAutomationsStore } from '../../store/editorStore'

const TRIGGER_ICONS = {
  'system.manual': '▶️',
  'system.schedule_once': '🕐',
  'system.schedule_interval': '🔁',
  'system.webhook_inbound': '🔗',
}

/**
 * N8n-style trigger node with pill-left shape.
 * First node in any workflow - only has output handle.
 */
function N8nTriggerNode({ id, data, selected }) {
  const { t } = useTranslation('automations')
  const setSelectedNodeId = useAutomationsStore((s) => s.setSelectedNodeId)

  const icon = TRIGGER_ICONS[data.ref_id] ?? '⚡'
  const title = data.ref_id ? t(`registry.nodes.${data.ref_id}`, { defaultValue: data.label ?? t('nodes.trigger') }) : (data.label ?? t('nodes.trigger'))
  const subtitle = summarizeConfig(data.config, t)

  return (
    <N8nBaseNode
      id={id}
      selected={selected}
      category="trigger"
      icon={icon}
      label={t('nodes.trigger')}
      title={title}
      subtitle={subtitle}
      minWidth={220}
    >
      <div
        onClick={() => setSelectedNodeId(id)}
        className="node-content"
        style={{ cursor: 'pointer' }}
      >
        <div className="node-icon-badge node-icon-badge--trigger">
          {icon}
        </div>
        <div className="node-text">
          <div className="node-label node-label--trigger">
            {t('nodes.trigger')}
          </div>
          <div className="node-title">{title}</div>
          {subtitle && <div className="node-subtitle">{subtitle}</div>}
        </div>
      </div>

      {/* Output handle only */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle node-handle--trigger"
      />
    </N8nBaseNode>
  )
}

function summarizeConfig(config, t) {
  if (!config || Object.keys(config).length === 0) return null
  
  if (config.interval_value && config.interval_unit) {
    return `${t('schedule.every')} ${config.interval_value} ${config.interval_unit}`
  }
  if (config.run_at) {
    return new Date(config.run_at).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }
  return null
}

export default memo(N8nTriggerNode)
