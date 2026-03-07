import api from './api'

const BASE = '/api/v1/calendar'

// ── Events ────────────────────────────────────────────────────────────────────

export const eventsService = {
  /** Lista eventos en un rango ISO 8601 */
  async getRange(start, end) {
    const { data } = await api.get(`${BASE}/events`, {
      params: { start: start.toISOString(), end: end.toISOString() },
    })
    return data
  },

  /** Eventos de hoy */
  async getToday() {
    const { data } = await api.get(`${BASE}/events/today`)
    return data
  },

  async getById(id) {
    const { data } = await api.get(`${BASE}/events/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post(`${BASE}/events`, payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`${BASE}/events/${id}`, payload)
    return data
  },

  async complete(id) {
    const { data } = await api.patch(`${BASE}/events/${id}/complete`)
    return data
  },

  async remove(id) {
    await api.delete(`${BASE}/events/${id}`)
  },
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export const remindersService = {
  /** Lista recordatorios. Filtra por status/priority si se proporcionan */
  async getAll({ status, priority } = {}) {
    const { data } = await api.get(`${BASE}/reminders`, {
      params: { ...(status && { status }), ...(priority && { priority }) },
    })
    return data
  },

  async create(payload) {
    const { data } = await api.post(`${BASE}/reminders`, payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`${BASE}/reminders/${id}`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`${BASE}/reminders/${id}`)
  },

  /** Asigna un recordatorio a una franja horaria — crea un Event vinculado */
  async schedule(id, payload) {
    const { data } = await api.post(`${BASE}/reminders/${id}/schedule`, payload)
    return data
  },
}

// ── Routines ──────────────────────────────────────────────────────────────────

export const routinesService = {
  async getAll() {
    const { data } = await api.get(`${BASE}/routines`)
    return data
  },

  async create(payload) {
    const { data } = await api.post(`${BASE}/routines`, payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.put(`${BASE}/routines/${id}`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`${BASE}/routines/${id}`)
  },

  async addException(routineId, payload) {
    const { data } = await api.post(`${BASE}/routines/${routineId}/exceptions`, payload)
    return data
  },
}

// ── Categories ────────────────────────────────────────────────────────────────

export const categoriesService = {
  async getAll() {
    const { data } = await api.get(`${BASE}/categories`)
    return data
  },

  async create(payload) {
    const { data } = await api.post(`${BASE}/categories`, payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`${BASE}/categories/${id}`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`${BASE}/categories/${id}`)
  },
}