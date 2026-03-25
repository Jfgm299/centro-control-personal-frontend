import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { registryService } from '../services/automationsApi'

/**
 * Categorías del sistema — siempre presentes, no vienen del backend.
 * Se mezclan con los triggers del registry para construir el árbol de la sidebar.
 * Los labels son los fallbacks en español; en runtime se traducen via translateLabel.
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

/** Labels de módulo para la sidebar — fallbacks en español */
export const MODULE_LABELS = {
  system:           { label: 'Sistema',     icon: '📌' },
  calendar_tracker: { label: 'Calendario',  icon: '📅' },
  gym_tracker:      { label: 'Gimnasio',    icon: '🏋️' },
  // Nuevos módulos se añaden aquí al integrarlos
}

const FALLBACK_MODULE = { label: 'Otros', icon: '⚙️' }

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Triggers disponibles: combina los del sistema (siempre) con los del backend (módulos instalados).
 */
export function useRegistryTriggers() {
  const { t } = useTranslation('automations')

  const translateLabel = (refId, fallback) =>
    t(`registry.nodes.${refId}`, { defaultValue: fallback })

  const translateModule = (moduleId, fallback) =>
    t(`registry.modules.${moduleId}`, { defaultValue: fallback })

  /**
   * Agrupa una lista de triggers/actions por module_id.
   * Mantiene el orden: primero system, luego el resto alfabético.
   */
  function groupByModule(items) {
    const grouped = {}

    // Sistema siempre primero
    const systemMeta = MODULE_LABELS['system']
    grouped['system'] = {
      ...systemMeta,
      label: translateModule('system', systemMeta.label),
      items: [],
    }

    for (const item of items) {
      const mod = item.module_id
      if (!grouped[mod]) {
        const meta = MODULE_LABELS[mod] ?? FALLBACK_MODULE
        grouped[mod] = {
          ...meta,
          label: translateModule(mod, meta.label),
          items: [],
        }
      }
      grouped[mod].items.push({
        ...item,
        label: translateLabel(item.ref_id, item.label),
      })
    }

    return grouped
  }

  const { data: backendTriggers = [], ...rest } = useQuery({
    queryKey: ['automations', 'registry', 'triggers'],
    queryFn:  registryService.getTriggers,
    staleTime: 1000 * 60 * 10,
  })

  // Deduplicar: el backend puede devolver triggers que ya están en SYSTEM_TRIGGERS
  const seen = new Set()
  const all  = [...SYSTEM_TRIGGERS, ...backendTriggers].filter(trigger => {
    if (seen.has(trigger.ref_id)) return false
    seen.add(trigger.ref_id)
    return true
  })

  // Aplicar traducción a los items del array plano también
  const allTranslated = all.map(trigger => ({
    ...trigger,
    label: translateLabel(trigger.ref_id, trigger.label),
  }))

  const grouped = groupByModule(all)

  return { data: allTranslated, grouped, ...rest }
}

/**
 * Acciones disponibles del backend (módulos instalados).
 * Las acciones de control de flujo son nodos nativos del canvas, no del registry.
 */
export function useRegistryActions() {
  const { t } = useTranslation('automations')

  const translateLabel = (refId, fallback) =>
    t(`registry.nodes.${refId}`, { defaultValue: fallback })

  const translateModule = (moduleId, fallback) =>
    t(`registry.modules.${moduleId}`, { defaultValue: fallback })

  function groupByModule(items) {
    const grouped = {}

    // Sistema siempre primero
    const systemMeta = MODULE_LABELS['system']
    grouped['system'] = {
      ...systemMeta,
      label: translateModule('system', systemMeta.label),
      items: [],
    }

    for (const item of items) {
      const mod = item.module_id
      if (!grouped[mod]) {
        const meta = MODULE_LABELS[mod] ?? FALLBACK_MODULE
        grouped[mod] = {
          ...meta,
          label: translateModule(mod, meta.label),
          items: [],
        }
      }
      grouped[mod].items.push({
        ...item,
        label: translateLabel(item.ref_id, item.label),
      })
    }

    return grouped
  }

  const { data: backendActions = [], ...rest } = useQuery({
    queryKey: ['automations', 'registry', 'actions'],
    queryFn:  registryService.getActions,
    staleTime: 1000 * 60 * 10,
  })

  const actionsTranslated = backendActions.map(action => ({
    ...action,
    label: translateLabel(action.ref_id, action.label),
  }))

  const grouped = groupByModule(backendActions)

  return { data: actionsTranslated, grouped, ...rest }
}