import api from './api'

const BASE        = '/api/v1/automations/'
const REGISTRY    = '/api/v1/automations/registry/'
const EXECUTIONS  = '/api/v1/automations/executions/'
const WEBHOOKS    = '/api/v1/automations/webhooks/'

// ── Automations ───────────────────────────────────────────────────────────────

export const automationsService = {
  async getAll() {
    const { data } = await api.get(BASE)
    return data
  },

  async getById(id) {
    const { data } = await api.get(`${BASE}${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post(BASE, payload)
    return data
  },

  /** Actualiza metadatos: nombre, descripción, is_active */
  async updateMeta(id, payload) {
    const { data } = await api.patch(`${BASE}${id}`, payload)
    return data
  },

  /** Actualiza el flujo completo (nodes + edges + trigger) */
  async updateFlow(id, payload) {
    const { data } = await api.put(`${BASE}${id}/flow`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`${BASE}${id}`)
  },

  async duplicate(id) {
    const { data } = await api.post(`${BASE}${id}/duplicate`)
    return data
  },

  /** Trigger manual — payload es el JSON del sandbox */
  async trigger(id, payload = {}) {
    const { data } = await api.post(`${BASE}${id}/trigger`, { payload })
    return data
  },

  async getExecutions(automationId) {
    const { data } = await api.get(`${BASE}${automationId}/executions`)
    return data
  },
}

// ── Executions ────────────────────────────────────────────────────────────────

export const executionsService = {
  /** Polling de una ejecución en curso */
  async getById(executionId) {
    const { data } = await api.get(`${EXECUTIONS}${executionId}`)
    return data
  },
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const registryService = {
  async getTriggers() {
    const { data } = await api.get(`${REGISTRY}triggers`)
    return data
  },

  async getActions() {
    const { data } = await api.get(`${REGISTRY}actions`)
    return data
  },
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export const webhooksService = {
  async create(automationId, name) {
    const { data } = await api.post(WEBHOOKS, { automation_id: automationId, name })
    return data
  },

  /** Envía POST de prueba al endpoint público — usado por el botón "Send Test" */
  async sendTest(token) {
    const { data } = await api.post(`${WEBHOOKS}in/${token}`, {
      source: 'frontend_test',
      data:   {},
    })
    return data
  },
}

// ── Export / Import JSON ──────────────────────────────────────────────────────

export const flowExportService = {
  /** Descarga el flujo como archivo JSON */
  exportToFile(automation) {
    const json = JSON.stringify({
      name:         automation.name,
      description:  automation.description,
      trigger_type: automation.trigger_type,
      trigger_ref:  automation.trigger_ref,
      flow:         automation.flow,
    }, null, 2)

    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `automation_${automation.name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  /** Importa un flujo desde un File JSON y crea una automatización */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = (e) => {
        try { resolve(JSON.parse(e.target.result)) }
        catch { reject(new Error('Invalid JSON file')) }
      }
      reader.onerror = () => reject(new Error('Could not read file'))
      reader.readAsText(file)
    })
  },
}