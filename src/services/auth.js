import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const authClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

export const authService = {
  register: async ({ email, username, password }) => {
    const { data } = await authClient.post('/api/v1/auth/register', { email, username, password })
    return data
  },

  login: async (credentials) => {
    const { data } = await authClient.post('/api/v1/auth/login', credentials)
    return data
  },

  refresh: async (refreshToken) => {
    const { data } = await authClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
    return data
  },

  logout: async (refreshToken) => {
    await authClient.post('/api/v1/auth/logout', { refresh_token: refreshToken })
  },

  me: async (accessToken) => {
    const { data } = await authClient.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return data
  },
}

export const tokenStorage = {
  get: () => ({
    accessToken:  localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  }),
  set: ({ access_token, refresh_token }) => {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
  },
  clear: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}