import api from './api'

// Chat del contrato entre el cliente y el estudiante (todo se conversa dentro de DEVUTEC)
export const chatService = {
  async list(contractId) {
    const { data } = await api.get(`/contracts/${contractId}/messages`)
    return data
  },

  async send(contractId, text) {
    const { data } = await api.post(`/contracts/${contractId}/messages`, { text })
    return data
  },
}
