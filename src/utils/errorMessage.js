import axios from 'axios'

// Convierte un error de axios en un texto para mostrar en pantalla
export function errorMessage(error, fallback = 'Ocurrió un error. Inténtalo otra vez.') {
  if (axios.isCancel(error)) return null

  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return 'El servidor tardó demasiado en responder. Inténtalo otra vez.'
    }
    return 'No hay conexión con el servidor. Revisa tu internet.'
  }

  const status = error.response.status
  const apiMessage = error.response.data?.message

  if (status === 403) return 'No tienes permiso para hacer esto.'
  if (status === 404) return 'No encontramos lo que buscas.'
  if (status >= 500) return 'El servidor tuvo un problema. Inténtalo en unos minutos.'
  return apiMessage ?? fallback
}
