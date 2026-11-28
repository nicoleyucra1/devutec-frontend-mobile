import api from './api'

// Certificado verificable de un contrato terminado (se crea la primera vez)
export const certificateService = {
  async forContract(contractId) {
    const { data } = await api.get(`/contracts/${contractId}/certificate`)
    return data
  },
}
