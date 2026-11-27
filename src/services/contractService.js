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

  // delivery: { link, nota }. El link es obligatorio (Drive, GitHub, Figma...); la nota es opcional
  async deliver(id, delivery) {
    const { data } = await api.patch(`/contracts/${id}/deliver`, delivery)
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

  // Pago con tarjeta (Stripe, modo prueba): devuelve { sessionId, checkoutUrl } para abrir la página de pago de Stripe
  // appReturnUrl: link para volver a la app cuando termina el pago en Stripe
  async startCheckout(id, appReturnUrl) {
    const { data } = await api.post(`/contracts/${id}/checkout`, { appReturnUrl })
    return data
  },

  // El backend le pregunta a Stripe si esa sesión ya se pagó y devuelve el contrato actualizado
  async confirmCheckout(id, sessionId) {
    const { data } = await api.post(`/contracts/${id}/checkout/confirm`, { sessionId })
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

  // Mini guía de una etapa (solo el estudiante): tareas con horas, preguntas para el cliente, riesgos, consejo,
  // avance vs. horas y revisión del precio. La primera vez la arma la IA; después devuelve la guardada.
  async getStageGuide(id, stageId) {
    const { data } = await api.post(`/contracts/${id}/stages/${stageId}/guide`)
    return data
  },

  async updateGuideTask(id, stageId, taskId, done) {
    const { data } = await api.patch(`/contracts/${id}/stages/${stageId}/guide/tasks/${taskId}`, { done })
    return data
  },
}