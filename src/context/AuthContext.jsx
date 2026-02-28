/**
 * AuthContext — estado global de autenticación.
 *
 * Expone:
 *   user        → UserResponse | null
 *   isLoading   → boolean (comprobando sesión inicial)
 *   login()     → hace login y recarga la app
 *   logout()    → limpia sesión
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService, tokenStorage } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // arranca en true para no parpadear

  // Al montar: intenta recuperar la sesión desde el token guardado
  useEffect(() => {
    const restoreSession = async () => {
      const { accessToken } = tokenStorage.get()
      if (!accessToken) {
        setIsLoading(false)
        return
      }
      try {
        const me = await authService.me(accessToken)
        setUser(me)
      } catch {
        // Token inválido o expirado — intentará renovar el interceptor si hay refresh_token.
        // Si falla también, el evento 'auth:logout' limpiará la sesión.
        tokenStorage.clear()
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  // Escucha el evento que emite el interceptor cuando el refresh falla
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
      tokenStorage.clear()
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = useCallback(async (credentials) => {
    const tokens = await authService.login(credentials)
    tokenStorage.set(tokens)
    const me = await authService.me(tokens.access_token)
    setUser(me)
    // Recarga la app para que todos los hooks re-fetchen con el token nuevo
    window.location.reload()
  }, [])

  const logout = useCallback(async () => {
    const { refreshToken } = tokenStorage.get()
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } catch {
      // ignora errores de logout en backend
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}