import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Stores up to 4 module IDs pinned to the mobile dock.
 * null = empty slot. Home button is always center, never stored here.
 *
 * Slots layout:  [0]  [1]  HOME  [2]  [3]
 */

const DEFAULT_DOCK_IDS = [null, null, null, null]

export const useDockStore = create(
  persist(
    (set, get) => ({
      dockIds: DEFAULT_DOCK_IDS,

      setDockIds: (ids) => {
        if (ids.length !== 4) return
        set({ dockIds: ids })
      },

      swapDockSlot: (slotIndex, newModuleId) => {
        const next = [...get().dockIds]
        next[slotIndex] = newModuleId
        set({ dockIds: next })
      },

      /** Returns true if added, false if full or already present */
      addToDock: (moduleId) => {
        const { dockIds } = get()
        if (dockIds.includes(moduleId)) return false
        const emptyIdx = dockIds.findIndex((id) => id === null)
        if (emptyIdx === -1) return false // full
        const next = [...dockIds]
        next[emptyIdx] = moduleId
        set({ dockIds: next })
        return true
      },

      removeFromDock: (moduleId) => {
        const next = get().dockIds.map((id) => (id === moduleId ? null : id))
        set({ dockIds: next })
      },

      isFull: () => get().dockIds.every((id) => id !== null),
    }),
    { name: 'dock-store' }
  )
)