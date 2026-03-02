/**
 * createApiClient.js — Factory para crear clientes HTTP con autenticación.
 * 
 * Cada módulo crea su propia instancia con:
 *   import { createApiClient } from '../../lib/createApiClient'
 *   const api = createApiClient()
 * 
 * Características:
 * - Añade Bearer token automáticamente
 * - Renueva access_token con refresh_token cuando recibe 401
 * - Maneja cola de peticiones durante el refresh
 * - Emite evento 'auth:logout' si el refresh falla
 */
import axios from 'axios'
import { authService, tokenStorage } from '../services/auth'

// Estado compartido entre todas las instancias para evitar múltiples refreshes simultáneos
let isRefreshing = false
let pendingQueue = []

const processPending = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  pendingQueue = []
}

export function createApiClient(options = {}) {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  // ── Request interceptor: añade Bearer token ─────────────────────────────
  client.interceptors.request.use((config) => {
    const { accessToken } = tokenStorage.get()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })

  // ── Response interceptor: refresh automático en 401 ─────────────────────
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      const is401 = error.response?.status === 401
      const alreadyRetried = originalRequest._retry
      const { refreshToken } = tokenStorage.get()

      // No hay refresh_token o ya se intentó → rechaza
      if (!is401 || alreadyRetried || !refreshToken) {
        return Promise.reject(error)
      }

      // Si ya hay un refresh en curso, encola la petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return client(originalRequest)
        })
      }

      // Inicia el proceso de refresh
      originalRequest._retry = true
      isRefreshing = true

      try {
        const tokens = await authService.refresh(refreshToken)
        tokenStorage.set(tokens)
        processPending(null, tokens.access_token)
        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
        return client(originalRequest)
      } catch (refreshError) {
        // Refresh falló — limpia sesión y notifica
        tokenStorage.clear()
        processPending(refreshError)
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
  )

  return client
}