import api from './api'

export const flightsService = {
  async getAll() {
    const { data } = await api.get('/api/v1/flights/')
    return data
  },
  async getPassport() {
    const { data } = await api.get('/api/v1/flights/passport')
    return data
  },
  async addFlight(payload) {
    const { data } = await api.post('/api/v1/flights/', payload)
    return data
  },
  async deleteFlight(id) {
    await api.delete(`/api/v1/flights/${id}`)
  },
  async updateNotes(id, notes) {
  const { data } = await api.patch(`/api/v1/flights/${id}/notes`, { notes })
  return data
  },
}