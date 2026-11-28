//Texto y tono de cada estado. El StatusBadge convierte el tono en los colores del tema (claro u oscuro):
//pending = ámbar, success = verde escrow, danger = rojo, progress = azul, neutral = gris
export const APPLICATION_STATUS = {
  PENDING: { label: 'Pendiente', tone: 'pending' },
  ACCEPTED: { label: 'Aceptada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
}

export const CONTRACT_STATUS = {
  IN_PROGRESS: { label: 'En curso', tone: 'progress' },
  DELIVERED: { label: 'Entregado', tone: 'pending' },
  CONFIRMED: { label: 'Confirmado', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'danger' },
}

// Estado de cada etapa del contrato (igual que en la web)
export const STAGE_STATUS = {
  PENDING: { label: 'Pendiente', tone: 'neutral' },
  IN_PROGRESS: { label: 'En curso', tone: 'progress' },
  DELIVERED: { label: 'Por revisar', tone: 'pending' },
  CHANGES_REQUESTED: { label: 'Con cambios', tone: 'pending' },
  APPROVED: { label: 'Aprobada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'neutral' },
}

export const PAYMENT_STATUS = {
  HELD: { label: 'Pago retenido', tone: 'pending' },
  RELEASED: { label: 'Pago liberado', tone: 'success' },
  REFUNDED: { label: 'Pago reembolsado', tone: 'neutral' },
}