import { errorMessage } from '../../utils/errorMessage'

// La traductora responde mensajes propios (fuera de tema, límite del día, la IA no respondió): se muestran tal cual
export function translationError(err) {
  const status = err?.response?.status
  const apiMessage = err?.response?.data?.message
  if (apiMessage && [422, 429, 502, 503].includes(status)) return apiMessage
  return errorMessage(err)
}
