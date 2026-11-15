import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { setSessionExpiredHandler } from '../services/api'
import { tokenStorage } from '../utils/tokenStorage'
import PropTypes from 'prop-types'

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

  // Cambia los datos del usuario con sesión (por ejemplo, su foto nueva) en pantalla y en SecureStore
  const updateUser = useCallback(async (next) => {
    await tokenStorage.setUser(next)
    setUser(next)
  }, [])

  // Con una sesión guardada se piden de nuevo los datos del usuario: así aparece su foto aunque la sesión
  // se haya iniciado antes de subirla. Si falla (por ejemplo, sin internet), se sigue con lo guardado.
  const sessionId = user?.id
  useEffect(() => {
    if (!sessionId) return
    let active = true
    userService
      .getMe()
      .then((me) => active && me.id === sessionId && updateUser(me))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [sessionId, updateUser])

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

  // Continuar con Google: idToken viene de la cuenta de Google y rol solo se manda al crear la cuenta
  const loginWithGoogle = async (data) => startSession(await authService.google(data))

  const value = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}
