import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Persists the user-defined order of home screen icons.
 * Initialized empty — HomePageMobile fills it from moduleStore on first load.
 */
export const useHomeStore = create(
  persist(
    (set, get) => ({
      order: [], // array of module IDs in display order

      setOrder: (order) => set({ order }),

      initOrder: (moduleIds) => {
        if (get().order.length === 0) set({ order: moduleIds })
      },

      moveModule: (fromId, toId) => {
        const next = [...get().order]
        const fromIdx = next.indexOf(fromId)
        const toIdx   = next.indexOf(toId)
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return
        const [item] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, item)
        set({ order: next })
      },
    }),
    { name: 'home-order-store' }
  )
)