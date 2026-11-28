import api from './api'

// «Volver a contratar»: invitaciones con 48 horas de exclusividad para el estudiante
export const invitationService = {
  async mine() {
    const { data } = await api.get('/invitations')
    return data
  },

  async decline(projectId) {
    await api.post(`/invitations/${projectId}/decline`)
  },
}
