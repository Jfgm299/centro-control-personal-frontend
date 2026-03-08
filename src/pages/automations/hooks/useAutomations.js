import { useQuery } from '@tanstack/react-query'
import { automationsService } from '../services/automationsApi'

export const AUTOMATIONS_KEY = ['automations']

/**
 * Lista completa de automatizaciones del usuario.
 * Se refresca cuando el usuario vuelve a la pestaña (windowFocus).
 */
export function useAutomations() {
  return useQuery({
    queryKey: AUTOMATIONS_KEY,
    queryFn:  automationsService.getAll,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Detalle de una automatización concreta — carga el flujo completo para el editor.
 * Solo se activa cuando tenemos un id válido.
 */
export function useAutomation(id) {
  return useQuery({
    queryKey: [...AUTOMATIONS_KEY, id],
    queryFn:  () => automationsService.getById(id),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Historial de ejecuciones de una automatización.
 */
export function useAutomationExecutions(automationId) {
  return useQuery({
    queryKey: [...AUTOMATIONS_KEY, automationId, 'executions'],
    queryFn:  () => automationsService.getExecutions(automationId),
    enabled:  !!automationId,
    staleTime: 1000 * 30,
  })
}