import { isFeatureEnabled } from '@/config/features'

// Legacy nodes (original components)
import TriggerNode        from '../nodes/TriggerNode'
import ActionNode         from '../nodes/ActionNode'
import ConditionNode      from '../nodes/ConditionNode'
import DelayNode          from '../nodes/DelayNode'
import WebhookInboundNode from '../nodes/WebhookInboundNode'
import StopNode           from '../nodes/StopNode'
import OutboundWebhookNode     from '../nodes/OutboundWebhookNode'

// N8n-style nodes (new design)
import N8nTriggerNode     from '../nodes/N8nTriggerNode'
import N8nActionNode      from '../nodes/N8nActionNode'
import N8nConditionNode   from '../nodes/N8nConditionNode'
import N8nDelayNode       from '../nodes/N8nDelayNode'
import N8nStopNode        from '../nodes/N8nStopNode'
import N8nWebhookInboundNode  from '../nodes/N8nWebhookInboundNode'
import N8nOutboundWebhookNode from '../nodes/N8nOutboundWebhookNode'

// Edges
import AnimatedEdge            from '../edges/AnimatedEdge'
import LegacyConditionEdge     from '../edges/LegacyConditionEdge'

/**
 * Mapeado tipo → componente para <ReactFlow nodeTypes={nodeTypes} />.
 * Los tipos coinciden con el campo `type` del modelo de nodo en el backend.
 * 
 * When N8N_NODES feature is enabled, uses new n8n-style node components.
 * Otherwise, uses legacy node components.
 */
const useN8nNodes = isFeatureEnabled('N8N_NODES')
const useN8nAnimations = isFeatureEnabled('N8N_ANIMATIONS')

export const nodeTypes = {
  trigger:          useN8nNodes ? N8nTriggerNode : TriggerNode,
  action:           useN8nNodes ? N8nActionNode : ActionNode,
  condition:        useN8nNodes ? N8nConditionNode : ConditionNode,
  delay:            useN8nNodes ? N8nDelayNode : DelayNode,
  webhook_inbound:  useN8nNodes ? N8nWebhookInboundNode : WebhookInboundNode,
  outbound_webhook: useN8nNodes ? N8nOutboundWebhookNode : OutboundWebhookNode,
  stop:             useN8nNodes ? N8nStopNode : StopNode,
}

export const edgeTypes = {
  ...(useN8nAnimations ? { default: AnimatedEdge } : {}),
  condition: useN8nAnimations ? AnimatedEdge : LegacyConditionEdge,
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
