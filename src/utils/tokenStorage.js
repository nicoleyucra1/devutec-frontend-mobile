import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const ACCESS_KEY = 'devutec.accessToken'
const REFRESH_KEY = 'devutec.refreshToken'
const USER_KEY = 'devutec.user'

// En el celular los tokens van cifrados en expo-secure-store (Keychain en iOS, Keystore en Android).
// SecureStore no existe en la web, así que ahí se usa localStorage solo para poder probar en el navegador.
const storage =
  Platform.OS === 'web'
    ? {
        getItem: async (key) => localStorage.getItem(key),
        setItem: async (key, value) => localStorage.setItem(key, value),
        deleteItem: async (key) => localStorage.removeItem(key),
      }
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        deleteItem: (key) => SecureStore.deleteItemAsync(key),
      }

// SecureStore es asíncrono. Se guarda una copia en memoria para que el interceptor
// de axios pueda leer el token sin esperar en cada petición.
let session = { accessToken: null, refreshToken: null, user: null }

export const tokenStorage = {
  // Se llama una vez al abrir la app
  async load() {
    const [accessToken, refreshToken, user] = await Promise.all([
      storage.getItem(ACCESS_KEY),
      storage.getItem(REFRESH_KEY),
      storage.getItem(USER_KEY),
    ])
    session = { accessToken, refreshToken, user: user ? JSON.parse(user) : null }
    return session
  },

  getAccessToken: () => session.accessToken,
  getRefreshToken: () => session.refreshToken,
  getUser: () => session.user,

  async setTokens(accessToken, refreshToken) {
    session = { ...session, accessToken, refreshToken }
    await Promise.all([storage.setItem(ACCESS_KEY, accessToken), storage.setItem(REFRESH_KEY, refreshToken)])
  },

  async setUser(user) {
    session = { ...session, user }
    await storage.setItem(USER_KEY, JSON.stringify(user))
  },

  async clear() {
    session = { accessToken: null, refreshToken: null, user: null }
    await Promise.all([storage.deleteItem(ACCESS_KEY), storage.deleteItem(REFRESH_KEY), storage.deleteItem(USER_KEY)])
  },
}
