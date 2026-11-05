import axios from 'axios'
import Constants from 'expo-constants'
import { tokenStorage } from '../utils/tokenStorage'
import { isOffline } from '../utils/network'

// Con EXPO_PUBLIC_API_URL (en .env o en eas.json para los builds) se usa esa dirección.
// Sin ella, en desarrollo se usa el backend local de la compu que corre Expo: su IP es la misma
// con la que el celular abrió la app, así que sigue funcionando aunque cambie la red.
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost'
  return `http://${host}:8080/api/v1`
}

export const API_URL = resolveApiUrl()

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

// Agrega el access token a todas las peticiones
api.interceptors.request.use((config) => {
  // Sin internet no tiene sentido esperar los 15 segundos del timeout: se corta al instante
  if (isOffline()) {
    throw new axios.AxiosError('Sin conexión a internet', 'ERR_OFFLINE', config)
  }
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// AuthProvider registra aquí qué hacer cuando la sesión ya no se puede renovar
let onSessionExpired = () => {}
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

// Renovación en curso. Si varias peticiones reciben 401 a la vez,
// todas esperan esta misma promesa en lugar de pedir un refresh cada una.
let refreshPromise = null

async function refreshTokens() {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No hay refresh token')
  }
  // Se usa axios directamente para no pasar por los interceptores de api
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 })
  await tokenStorage.setTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthRequest = original?.url?.startsWith('/auth/')

    // Solo se renueva ante un 401, una vez por petición y nunca en login o registro
    if (error.response?.status !== 401 || !original || original._retry || isAuthRequest) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = null
        })
      }
      const accessToken = await refreshPromise
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshError) {
      // Si el refresh falló por la red (sin señal, timeout), la sesión sigue siendo válida:
      // no se cierra, solo falla esta petición. Se cierra solo si el backend rechazó el refresh token.
      if (refreshError.response || !tokenStorage.getRefreshToken()) {
        await tokenStorage.clear()
        onSessionExpired()
      }
      return Promise.reject(error)
    }
  },
)

// Reintento de errores recuperables: timeout, red inestable o servidor caído un momento (502, 503, 504).
// Solo para GET, porque repetir un POST podría crear algo dos veces.
const MAX_RETRIES = 2
const RECOVERABLE_STATUS = [502, 503, 504]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function isRecoverable(error) {
  if (axios.isCancel(error) || error.code === 'ERR_OFFLINE') return false
  if (!error.response) return true
  return RECOVERABLE_STATUS.includes(error.response.status)
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const isGet = config?.method === 'get'
    const retries = config?._retries ?? 0

    if (!isGet || !isRecoverable(error) || retries >= MAX_RETRIES || config.signal?.aborted) {
      return Promise.reject(error)
    }

    config._retries = retries + 1
    // Espera cada vez más entre intentos: 1 s y luego 2 s
    await wait(1000 * config._retries)
    return api(config)
  },
)

export default api
