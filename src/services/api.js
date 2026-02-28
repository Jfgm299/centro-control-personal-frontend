/**
 * api.js — instancia axios compartida.
 * Añade el token Bearer automáticamente y renueva el access_token
 * con el refresh_token cuando recibe un 401, de forma transparente.
 */
import axios from 'axios'
import { authService, tokenStorage } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: añade el token ────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const { accessToken } = tokenStorage.get()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ── Response: reintenta con token renovado si recibe 401 ──────────────────
let isRefreshing = false
let pendingQueue = [] // peticiones que esperan al nuevo token

const processPending = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const is401 = error.response?.status === 401
    const alreadyRetried = originalRequest._retry
    const { refreshToken } = tokenStorage.get()

    // Si no hay refresh_token disponible, no intentamos renovar
    if (!is401 || alreadyRetried || !refreshToken) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Encola la petición hasta que el refresh termine
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const tokens = await authService.refresh(refreshToken)
      tokenStorage.set(tokens)
      processPending(null, tokens.access_token)
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
      return api(originalRequest)
    } catch (refreshError) {
      // Refresh falló — limpia sesión y emite evento para que la UI reaccione
      tokenStorage.clear()
      processPending(refreshError)
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api