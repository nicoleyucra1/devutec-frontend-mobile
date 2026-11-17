import api from './api'

// Pagos de toda la plataforma (solo admin): { id, amount, status, createdAt, contractId, projectTitle, clientName, freelancerName }
export const paymentService = {
  async getAll({ signal } = {}) {
    const { data } = await api.get('/payments', { signal })
    return data
  },
}
