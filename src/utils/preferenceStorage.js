import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// Preferencias pequeñas de la app (por ejemplo el modo claro u oscuro).
// En el celular usa SecureStore, que ya está instalado; en la web, localStorage.
export const preferenceStorage = {
  async get(key) {
    try {
      return Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  async set(key, value) {
    try {
      if (Platform.OS === 'web') localStorage.setItem(key, value)
      else await SecureStore.setItemAsync(key, value)
    } catch {
      // Si no se puede guardar, la preferencia solo dura mientras la app está abierta
    }
  },
}
