import { create } from 'zustand'

export const useCalendarStore = create((set) => ({
  // Modal crear/editar evento
  eventModalOpen: false,
  eventModalData: null,
  openEventModal:  (data = null) => set({ eventModalOpen: true, eventModalData: data }),
  closeEventModal: ()            => set({ eventModalOpen: false, eventModalData: null }),

  // ── Categorías ocultas en el calendario ──────────────────────────────────
  hiddenCategoryIds: new Set(),
  toggleCategoryVisibility: (id) =>
    set((s) => {
      const next = new Set(s.hiddenCategoryIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { hiddenCategoryIds: next }
    }),
  isCategoryVisible: (id) => (s) => !s.hiddenCategoryIds.has(id),

  // ── Rutinas ocultas en el calendario ─────────────────────────────────────
  hiddenRoutineIds: new Set(),
  toggleRoutineVisibility: (id) =>
    set((s) => {
      const next = new Set(s.hiddenRoutineIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { hiddenRoutineIds: next }
    }),
}))