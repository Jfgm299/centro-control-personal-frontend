import { create } from 'zustand'
import { loadAllModules, getHomeModule } from '../lib/moduleLoader'

const HOME = getHomeModule()

export const useModuleStore = create((set, get) => ({
  modules: [],
  modulesLoaded: false,
  modulesError: null,

  openTabs: [HOME],
  activeTabId: HOME.id,

  loadModules: async () => {
    try {
      const modules = loadAllModules()
      set({
        modules,
        modulesLoaded: true,
        modulesError: null,
      })
    } catch (error) {
      set({ modulesError: error.message, modulesLoaded: true })
    }
  },

  openModule: (moduleId) => {
    const { modules, openTabs } = get()

    if (moduleId === 'home') {
      set({ activeTabId: 'home' })
      return
    }

    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const alreadyOpen = openTabs.find(t => t.id === moduleId)
    if (!alreadyOpen) {
      set({ openTabs: [...openTabs, module] })
    }
    set({ activeTabId: moduleId })
  },

  closeTab: (moduleId) => {
    const { openTabs, activeTabId } = get()

    if (moduleId === 'home') return

    const newTabs = openTabs.filter(t => t.id !== moduleId)
    let newActiveId = activeTabId

    if (activeTabId === moduleId) {
      const idx = openTabs.findIndex(t => t.id === moduleId)
      const fallback = newTabs[idx - 1] || newTabs[0]
      newActiveId = fallback?.id || 'home'
    }

    set({ openTabs: newTabs, activeTabId: newActiveId })
  },

  setActiveTab: (moduleId) => set({ activeTabId: moduleId }),
}))