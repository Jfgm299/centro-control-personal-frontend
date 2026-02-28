/**
 * auth.js — todas las llamadas HTTP relacionadas con autenticación.
 * Usa axios directamente (sin el interceptor de token) para evitar
 * ciclos infinitos en login/refresh.
 */
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Cliente limpio sin interceptores — solo para auth
const authClient = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

export const authService = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {{ access_token, refresh_token, token_type }}
   */
  login: async (credentials) => {
    const { data } = await authClient.post('/api/v1/auth/login', credentials)
    return data
  },

  /**
   * @param {string} refreshToken
   * @returns {{ access_token, refresh_token, token_type }}
   */
  refresh: async (refreshToken) => {
    const { data } = await authClient.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    return data
  },

  /**
   * @param {string} refreshToken
   */
  logout: async (refreshToken) => {
    await authClient.post('/api/v1/auth/logout', {
      refresh_token: refreshToken,
    })
  },

  /**
   * Obtiene el usuario actual. Requiere access_token en header.
   * @param {string} accessToken
   * @returns {UserResponse}
   */
  me: async (accessToken) => {
    const { data } = await authClient.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return data
  },
}

// ── Token storage helpers ──────────────────────────────────────────────────

export const tokenStorage = {
  get: () => ({
    accessToken: localStorage.getItem('access_token'),
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