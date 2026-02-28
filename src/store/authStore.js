import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: {
    username: 'jf',
    email: 'jf@centrocontrol.app',
    avatar: null,
  },
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}))