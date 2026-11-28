import { Platform } from 'react-native'
import api from './api'

// Verificación universitaria (igual que en la web): correo .edu.pe al registrarse y foto del carnet que revisa el admin
export const verificationService = {
  // { status: null | PENDING | APPROVED | REJECTED, rejectReason, universityEmail }
  getMyStatus: ({ signal } = {}) => api.get('/users/me/carnet', { signal }).then((res) => res.data),

  // uri: foto ya pasada a JPEG. En el celular se manda la ruta; en la versión web, el archivo
  uploadCarnet: async (uri) => {
    const form = new FormData()
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob()
      form.append('file', blob, 'carnet.jpg')
    } else {
      form.append('file', { uri, name: 'carnet.jpg', type: 'image/jpeg' })
    }
    const config =
      Platform.OS === 'web'
        ? { timeout: 60000 }
        : { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (body) => body, timeout: 60000 }
    const { data } = await api.put('/users/me/carnet', form, config)
    return data
  },
}
