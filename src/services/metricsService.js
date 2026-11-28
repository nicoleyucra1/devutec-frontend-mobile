import api from './api'

// Métricas DEVUTEC de la web de un contrato (igual que en la web)
export const metricsService = {
  get: (contractId, { signal } = {}) => api.get(`/contracts/${contractId}/metrics`, { signal }).then((res) => res.data),
  // El cliente las activa con su consentimiento
  enable: (contractId) => api.post(`/contracts/${contractId}/metrics`, { consent: true }).then((res) => res.data),
  disable: (contractId) => api.delete(`/contracts/${contractId}/metrics`).then((res) => res.data),
  // Plan Básico o Pro: devuelve { sessionId, checkoutUrl } de Stripe
  subscribe: (contractId, plan) => api.post(`/contracts/${contractId}/metrics/subscription`, { plan }).then((res) => res.data),
  confirmSubscription: (contractId, sessionId) =>
    api.post(`/contracts/${contractId}/metrics/subscription/confirm`, { sessionId }).then((res) => res.data),
  // Reporte Pro (Amplitude)
  advanced: (contractId, { signal } = {}) => api.get(`/contracts/${contractId}/metrics/advanced`, { signal }).then((res) => res.data),
}
