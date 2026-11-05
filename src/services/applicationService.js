import api from './api'

// Postulaciones: el freelancer postula y retira; el cliente ve los postulantes de su proyecto y acepta o rechaza
export const applicationService = {
  async apply({ projectId, message, proposedPrice }) {
    const { data } = await api.post('/applications', { projectId, message, proposedPrice })
    return data
  },

  async getMine({ signal } = {}) {
    const { data } = await api.get('/applications/me', { signal })
    return data
  },

  async getByProject(projectId, { signal } = {}) {
    const { data } = await api.get('/applications', { params: { projectId }, signal })
    return data
  },

  async accept(id) {
    const { data } = await api.patch(`/applications/${id}/accept`)
    return data
  },

  async reject(id) {
    const { data } = await api.patch(`/applications/${id}/reject`)
    return data
  },

  async withdraw(id) {
    await api.delete(`/applications/${id}`)
  },
}