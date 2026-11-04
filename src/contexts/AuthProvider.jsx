import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { setSessionExpiredHandler } from '../services/api'
import { tokenStorage } from '../utils/tokenStorage'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Mientras se lee la sesión guardada en SecureStore no se sabe si hay usuario
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tokenStorage
      .load()
      .then((session) => setUser(session.accessToken ? session.user : null))
      .finally(() => setLoading(false))
  }, [])

  const logout = useCallback(async () => {
    await tokenStorage.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null))
  }, [])

  // Guarda los tokens y pide los datos completos del usuario (id y nombre) a GET /users/me
  const startSession = async (data) => {
    await tokenStorage.setTokens(data.accessToken, data.refreshToken)
    try {
      const me = await userService.getMe()
      await tokenStorage.setUser(me)
      setUser(me)
      return me
    } catch (error) {
      await tokenStorage.clear()
      throw error
    }
  }

  const login = async (credentials) => startSession(await authService.login(credentials))

  // El registro también devuelve tokens, así que el usuario queda logueado
  const register = async (data) => startSession(await authService.register(data))

  const value = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
