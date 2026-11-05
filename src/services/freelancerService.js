import api from './api'

export const freelancerService = {
  // Perfil del freelancer con sesión: universidad, tarifa, githubUsername... (GET /freelancers/me)
  async getMine({ signal } = {}) {
    const { data } = await api.get('/freelancers/me', { signal })
    return data
  },

  // Perfil público de cualquier freelancer, buscado por su id de usuario (GET /freelancers/{userId})
  async getByUserId(userId, { signal } = {}) {
    const { data } = await api.get(`/freelancers/${userId}`, { signal })
    return data
  },
}
