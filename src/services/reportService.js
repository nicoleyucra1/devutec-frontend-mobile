import api from './api'

// Reportar a la otra persona de un contrato (mismo endpoint que la web). Lo revisa el admin.
export const reportService = {
  create: (data) => api.post('/reports', data).then((res) => res.data),
}

export const REPORT_REASONS = {
  PAGO_POR_FUERA: 'Me pidió pagar o cobrar por fuera de DEVUTEC',
  CONTACTO_POR_FUERA: 'Me pidió hablar o trabajar por fuera de DEVUTEC',
  OTRO: 'Otro motivo',
}
