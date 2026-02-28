import api from './api'
import MODULE_REGISTRY from '../config/moduleRegistry'

export const modulesService = {
  async getActiveModules() {
    const { data } = await api.get('/api/v1/modules')
    // Cruzar los módulos activos del backend con el registry visual
    return data.modules
      .filter(id => MODULE_REGISTRY[id]) // ignorar módulos sin registry
      .map(id => MODULE_REGISTRY[id])
  },
}