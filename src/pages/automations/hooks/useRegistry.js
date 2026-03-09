import { useQuery } from '@tanstack/react-query'
import { registryService } from '../services/automationsApi'

/**
 * Categorías del sistema — siempre presentes, no vienen del backend.
 * Se mezclan con los triggers del registry para construir el árbol de la sidebar.
 */
export const SYSTEM_TRIGGERS = [
  {
    ref_id:       'system.manual',
    module_id:    'system',
    label:        'Manual',
    description:  'Se ejecuta al pulsar el botón Ejecutar',
    icon:         '▶️',
    config_schema: {},
  },
  {
    ref_id:       'system.schedule_once',
    module_id:    'system',
    label:        'A una hora exacta',
    description:  'Se ejecuta una vez en la fecha y hora indicadas',
    icon:         '🕐',
    config_schema: {
      run_at: { type: 'datetime', label: 'Fecha y hora', required: true },
    },
  },
  {
    ref_id:       'system.schedule_interval',
    module_id:    'system',
    label:        'Cada X tiempo',
    description:  'Se repite con el intervalo configurado',
    icon:         '🔁',
    config_schema: {
      interval_value:  { type: 'int',    label: 'Cada',       required: true, default: 30 },
      interval_unit:   { type: 'enum',   label: 'Unidad',     required: true, options: ['minutes', 'hours', 'days'], default: 'minutes' },
      active_from:     { type: 'time',   label: 'Desde',      optional: true },
      active_until:    { type: 'time',   label: 'Hasta',      optional: true },
      active_weekdays: { type: 'weekdays', label: 'Días activos', optional: true },
    },
  },
  {
    ref_id:       'system.webhook_inbound',
    module_id:    'system',
    label:        'Webhook entrante',
    description:  'Se activa cuando una app externa hace POST a la URL generada',
    icon:         '🔗',
    config_schema: {},   // La URL la gestiona el backend
  },
]

/** Labels de módulo para la sidebar */
export const MODULE_LABELS = {
  system:           { label: 'Sistema',     icon: '📌' },
  calendar_tracker: { label: 'Calendario',  icon: '📅' },
  gym_tracker:      { label: 'Gimnasio',    icon: '🏋️' },
  // Nuevos módulos se añaden aquí al integrarlos
}

const FALLBACK_MODULE = { label: 'Otros', icon: '⚙️' }

/**
 * Agrupa una lista de triggers/actions por module_id.
 * Mantiene el orden: primero system, luego el resto alfabético.
 */
function groupByModule(items) {
  const grouped = {}

  // Sistema siempre primero
  grouped['system'] = { ...MODULE_LABELS['system'], items: [] }

  for (const item of items) {
    const mod = item.module_id
    if (!grouped[mod]) {
      grouped[mod] = { ...(MODULE_LABELS[mod] ?? FALLBACK_MODULE), items: [] }
    }
    grouped[mod].items.push(item)
  }

  return grouped
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Triggers disponibles: combina los del sistema (siempre) con los del backend (módulos instalados).
 */
export function useRegistryTriggers() {
  const { data: backendTriggers = [], ...rest } = useQuery({
    queryKey: ['automations', 'registry', 'triggers'],
    queryFn:  registryService.getTriggers,
    staleTime: 1000 * 60 * 10,
  })

  // Deduplicar: el backend puede devolver triggers que ya están en SYSTEM_TRIGGERS
  const seen = new Set()
  const all  = [...SYSTEM_TRIGGERS, ...backendTriggers].filter(t => {
    if (seen.has(t.ref_id)) return false
    seen.add(t.ref_id)
    return true
  })
  const grouped = groupByModule(all)

  return { data: all, grouped, ...rest }
}

/**
 * Acciones disponibles del backend (módulos instalados).
 * Las acciones de control de flujo son nodos nativos del canvas, no del registry.
 */
export function useRegistryActions() {
  const { data: backendActions = [], ...rest } = useQuery({
    queryKey: ['automations', 'registry', 'actions'],
    queryFn:  registryService.getActions,
    staleTime: 1000 * 60 * 10,
  })

  const grouped = groupByModule(backendActions)

  return { data: backendActions, grouped, ...rest }
}