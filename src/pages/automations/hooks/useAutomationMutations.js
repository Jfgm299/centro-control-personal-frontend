import { useMutation, useQueryClient } from '@tanstack/react-query'
import { automationsService, flowExportService, webhooksService } from '../services/automationsApi'
import { AUTOMATIONS_KEY } from './useAutomations'

const invalidateList   = (qc) => qc.invalidateQueries({ queryKey: AUTOMATIONS_KEY })
const invalidateDetail = (qc, id) => qc.invalidateQueries({ queryKey: [...AUTOMATIONS_KEY, id] })

export function useAutomationMutations() {
  const qc = useQueryClient()

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const create = useMutation({
    mutationFn: automationsService.create,
    onSuccess:  () => invalidateList(qc),
  })

  const updateMeta = useMutation({
    mutationFn: ({ id, ...payload }) => automationsService.updateMeta(id, payload),
    onSuccess:  (_, { id }) => {
      invalidateList(qc)
      invalidateDetail(qc, id)
    },
  })

  const updateFlow = useMutation({
    mutationFn: ({ id, ...payload }) => automationsService.updateFlow(id, payload),
    onSuccess:  (_, { id }) => {
      invalidateList(qc)
      invalidateDetail(qc, id)
    },
  })

  const remove = useMutation({
    mutationFn: automationsService.remove,
    onSuccess:  () => invalidateList(qc),
  })

  // ── Duplicate ─────────────────────────────────────────────────────────────

  const duplicate = useMutation({
    mutationFn: automationsService.duplicate,
    onSuccess:  () => invalidateList(qc),
  })

  // ── Toggle active ─────────────────────────────────────────────────────────

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }) => automationsService.updateMeta(id, { is_active }),
    onSuccess:  (_, { id }) => {
      invalidateList(qc)
      invalidateDetail(qc, id)
    },
  })

  // ── Manual trigger ────────────────────────────────────────────────────────

  const trigger = useMutation({
    mutationFn: ({ id, payload }) => automationsService.trigger(id, payload),
    onSuccess:  (_, { id }) =>
      qc.invalidateQueries({ queryKey: [...AUTOMATIONS_KEY, id, 'executions'] }),
  })

  // ── Export / Import ───────────────────────────────────────────────────────

  const exportFlow = (automation) => flowExportService.exportToFile(automation)

  const importFlow = useMutation({
    mutationFn: async (file) => {
      const parsed = await flowExportService.importFromFile(file)
      return automationsService.create({
        name:         `${parsed.name} (importada)`,
        description:  parsed.description ?? '',
        flow:         parsed.flow,
        trigger_type: parsed.trigger_type ?? 'module_event',
        trigger_ref:  parsed.trigger_ref  ?? null,
        is_active:    false,
      })
    },
    onSuccess: () => invalidateList(qc),
  })

  // ── Webhook creation ──────────────────────────────────────────────────────

  const createWebhook = useMutation({
    mutationFn: ({ automationId, name }) => webhooksService.create(automationId, name),
  })

  return {
    create,
    updateMeta,
    updateFlow,
    remove,
    duplicate,
    toggleActive,
    trigger,
    exportFlow,
    importFlow,
    createWebhook,
  }
}