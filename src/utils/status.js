//Texto y tono de cada estado. El StatusBadge convierte el tono en los colores del tema (claro u oscuro):
//pending = ámbar, success = verde escrow, danger = rojo, progress = azul, neutral = gris
export const APPLICATION_STATUS = {
  PENDING: { label: 'Pendiente', tone: 'pending' },
  ACCEPTED: { label: 'Aceptada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
}

export const CONTRACT_STATUS = {
  IN_PROGRESS: { label: 'En progreso', tone: 'progress' },
  DELIVERED: { label: 'Entregado', tone: 'pending' },
  CONFIRMED: { label: 'Completado', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'danger' },
}

export const PAYMENT_STATUS = {
  HELD: { label: 'Pago retenido', tone: 'pending' },
  RELEASED: { label: 'Pago liberado', tone: 'success' },
  REFUNDED: { label: 'Pago reembolsado', tone: 'neutral' },
}