import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Stores the 4 module IDs pinned to the mobile dock.
 * The home button is always in the center — not stored here.
 *
 * Default order: the first 4 non-home modules from moduleStore.
 * User can reorder or swap via long-press (future feature).
 */

const DEFAULT_DOCK_IDS = ['flights', 'gym', 'macro', 'expenses']

export const useDockStore = create(
  persist(
    (set, get) => ({
      dockIds: DEFAULT_DOCK_IDS, // exactly 4 ids

      setDockIds: (ids) => {
        if (ids.length !== 4) return
        set({ dockIds: ids })
      },

      swapDockSlot: (slotIndex, newModuleId) => {
        const next = [...get().dockIds]
        next[slotIndex] = newModuleId
        set({ dockIds: next })
      },
    }),
    {
      name: 'dock-store', // localStorage key
    }
  )
)