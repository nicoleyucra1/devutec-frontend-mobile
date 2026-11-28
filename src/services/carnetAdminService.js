import api from './api'

// Admin: revisión de los carnets universitarios (segunda verificación del estudiante)
export const carnetAdminService = {
  async list(status) {
    const { data } = await api.get('/admin/carnets', { params: status ? { status } : {} })
    return data
  },

  async review(userId, { approved, reason }) {
    const { data } = await api.patch(`/admin/carnets/${userId}`, { approved, reason: reason || null })
    return data
  },

  // La foto es privada (va con el token): se descarga y se muestra como data URI
  async imageDataUri(userId) {
    const { data } = await api.get(`/users/${userId}/carnet/image`, { responseType: 'blob' })
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(data)
    })
  },
}
