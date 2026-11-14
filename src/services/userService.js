import { Platform } from 'react-native'
import api from './api'
import { avatarFormData } from '../utils/avatar'

export const userService = {
  // Devuelve { id, nombre, email, rol, avatarUrl } del usuario con sesión
  getMe: () => api.get('/users/me').then((res) => res.data),

  // Sube o reemplaza la foto de perfil. Devuelve el usuario con la nueva avatarUrl.
  // En el celular el Content-Type va explícito y React Native le agrega el boundary.
  // En la versión web lo arma el navegador, así que no se pone.
  uploadAvatar: async (uri) => {
    const form = await avatarFormData(uri)
    const config = Platform.OS === 'web' ? {} : { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (body) => body }
    const { data } = await api.put('/users/me/avatar', form, config)
    return data
  },

  // Quita la foto de perfil. Devuelve el usuario con avatarUrl en null.
  deleteAvatar: () => api.delete('/users/me/avatar').then((res) => res.data),
}
