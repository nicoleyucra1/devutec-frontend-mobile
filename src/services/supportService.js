import api from './api'

// Asistente de ayuda (Cuyi con IA). data: { message, history: [{ role: 'user' | 'assistant', text }] }
// Devuelve { reply, remaining }: la respuesta y cuántas preguntas le quedan hoy a la persona.
export const supportService = {
  ask: (data) => api.post('/support/chat', data).then((res) => res.data),
}
