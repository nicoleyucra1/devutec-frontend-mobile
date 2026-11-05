import api from './api'

// Contratos y sus reseñas. El contrato se crea solo en el backend cuando el cliente acepta una postulación.
export const contractService = {
  async getMine({ signal } = {}) {
    const { data } = await api.get('/contracts/me', { signal })
    return data
  },

  async getById(id, { signal } = {}) {
    const { data } = await api.get(`/contracts/${id}`, { signal })
    return data
  },

  async deliver(id) {
    const { data } = await api.patch(`/contracts/${id}/deliver`)
    return data
  },

  async confirm(id) {
    const { data } = await api.patch(`/contracts/${id}/confirm`)
    return data
  },

  async cancel(id) {
    const { data } = await api.patch(`/contracts/${id}/cancel`)
    return data
  },

  async getReviews(id, { signal } = {}) {
    const { data } = await api.get(`/contracts/${id}/reviews`, { signal })
    return data
  },

  async createReview(id, { rating, comment }) {
    const { data } = await api.post(`/contracts/${id}/reviews`, { rating, comment })
    return data
  },
}