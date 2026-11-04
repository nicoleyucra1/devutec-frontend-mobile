import axios from 'axios'

// Convierte un error de axios en un texto para mostrar en pantalla.
// Cada caso tiene su mensaje; si el backend manda uno más específico, se usa ese.
export function errorMessage(error, fallback = 'Ocurrió un error. Inténtalo otra vez.') {
  if (axios.isCancel(error)) return null

  // Sin respuesta del servidor
  if (!error?.response) {
    if (error?.code === 'ERR_OFFLINE') {
      return 'Sin conexión a internet. Revisa tu wifi o tus datos e inténtalo otra vez.'
    }
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return 'El servidor tardó demasiado en responder. Inténtalo otra vez.'
    }
    return 'No pudimos conectarnos con el servidor. Inténtalo en unos minutos.'
  }

  const status = error.response.status
  const apiMessage = error.response.data?.message

  switch (status) {
    case 400:
      return apiMessage ?? 'Revisa los datos ingresados.'
    case 401:
      return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    case 403:
      return 'No tienes permiso para hacer esto.'
    case 404:
      return 'No encontramos lo que buscas.'
    case 409:
      return apiMessage ?? 'La operación entra en conflicto con datos existentes.'
    default:
      if (status >= 500) return 'El servidor tuvo un problema. Inténtalo en unos minutos.'
      return apiMessage ?? fallback
  }
}
