import { create } from 'zustand'

/**
 * Global drag state for the home screen icon drag-to-dock feature.
 * Non-reactive dockBounds is updated by DockMobile on each render.
 */

export let dockBounds = null
export const setDockBounds = (bounds) => { dockBounds = bounds }

export const useDragStore = create((set) => ({
  isDragging:     false,
  draggingModule: null, // full module object
  ghostX:         0,
  ghostY:         0,
  overDock:       false,

  startDrag: (module, x, y) =>
    set({ isDragging: true, draggingModule: module, ghostX: x, ghostY: y, overDock: false }),

  updateGhost: (x, y) => {
    const over = dockBounds
      ? x >= dockBounds.left && x <= dockBounds.right &&
        y >= dockBounds.top  && y <= dockBounds.bottom
      : false
    set({ ghostX: x, ghostY: y, overDock: over })
  },

  endDrag: () =>
    set({ isDragging: false, draggingModule: null, ghostX: 0, ghostY: 0, overDock: false }),
}))