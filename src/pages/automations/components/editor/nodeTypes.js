import TriggerNode        from '../nodes/TriggerNode'
import ActionNode         from '../nodes/ActionNode'
import ConditionNode      from '../nodes/ConditionNode'
import DelayNode          from '../nodes/DelayNode'
import WebhookInboundNode from '../nodes/WebhookInboundNode'
import StopNode           from '../nodes/StopNode'
import ConditionEdge           from '../edges/ConditionEdge'
import OutboundWebhookNode     from '../nodes/OutboundWebhookNode'

/**
 * Mapeado tipo → componente para <ReactFlow nodeTypes={nodeTypes} />.
 * Los tipos coinciden con el campo `type` del modelo de nodo en el backend.
 */
export const nodeTypes = {
  trigger:         TriggerNode,
  action:          ActionNode,
  condition:       ConditionNode,
  delay:           DelayNode,
  webhook_inbound:  WebhookInboundNode,
  outbound_webhook: OutboundWebhookNode,
  stop:             StopNode,
}

export const edgeTypes = {
  condition: ConditionEdge,
}

/**
 * Dado un ref_id del registry, devuelve el tipo de nodo del canvas.
 * Usado al hacer drag & drop desde el sidebar.
 */
export function refIdToNodeType(refId, isAction = false) {
  const map = {
    'system.manual':                        'trigger',
    'system.schedule_once':                 'trigger',
    'system.schedule_interval':             'trigger',
    'system.webhook_inbound':               'webhook_inbound',
    'automations_engine.outbound_webhook':  'outbound_webhook',
    'automations_engine.delay':             'delay',
    'automations_engine.stop':              'stop',
    'flow.condition':                       'condition',
    'flow.delay':                           'delay',
    'flow.stop':                            'stop',
  }
  return map[refId] ?? (isAction ? 'action' : 'trigger')
}

/**
 * Items de control de flujo — hardcoded, no vienen del backend.
 * Se muestran en la sidebar bajo la sección "Control de flujo".
 * labelKey/descKey son claves i18n resueltas por NodeSidebar.
 */
export const FLOW_CONTROL_ITEMS = [
  { ref_id: 'flow.condition', type: 'condition', labelKey: 'nodes.condition', icon: '🔀', descKey: 'sidebar.conditionDesc' },
  { ref_id: 'flow.delay',     type: 'delay',     labelKey: 'nodes.delay',     icon: '⏳', descKey: 'sidebar.delayDesc' },
  { ref_id: 'flow.stop',      type: 'stop',      labelKey: 'nodes.stop',      icon: '🛑', descKey: 'sidebar.stopDesc' },
]