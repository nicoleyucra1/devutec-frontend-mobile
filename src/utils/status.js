// Texto y colores de cada estado para el StatusBadge
export const APPLICATION_STATUS = {
  PENDING: { label: 'Pendiente', color: '#92400e', background: '#fef3c7' },
  ACCEPTED: { label: 'Aceptada', color: '#166534', background: '#dcfce7' },
  REJECTED: { label: 'Rechazada', color: '#991b1b', background: '#fee2e2' },
}

export const CONTRACT_STATUS = {
  IN_PROGRESS: { label: 'En progreso', color: '#4338ca', background: '#e0e7ff' },
  DELIVERED: { label: 'Entregado', color: '#92400e', background: '#fef3c7' },
  CONFIRMED: { label: 'Completado', color: '#166534', background: '#dcfce7' },
  CANCELLED: { label: 'Cancelado', color: '#991b1b', background: '#fee2e2' },
}

export const PAYMENT_STATUS = {
  HELD: { label: 'Pago retenido', color: '#92400e', background: '#fef3c7' },
  RELEASED: { label: 'Pago liberado', color: '#166534', background: '#dcfce7' },
  REFUNDED: { label: 'Pago reembolsado', color: '#374151', background: '#f3f4f6' },
}