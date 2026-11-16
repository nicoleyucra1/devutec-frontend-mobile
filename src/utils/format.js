const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function formatBudget(value) {
  return value === null || value === undefined ? '—' : money.format(value)
}

// "2026-11-10" se lee como fecha local para que no se corra un día por la zona horaria
export function formatDate(value) {
  if (!value) return 'Sin fecha límite'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const STATUS_LABELS = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En curso',
  DONE: 'Terminado',
}

// "12 dic": fecha corta para las tarjetas
export function formatShortDate(value) {
  if (!value) return ''
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '').toLowerCase()}`
}

// "Lunes, 14 dic": la fecha de hoy arriba del saludo
export function todayLabel(date) {
  const weekday = date.toLocaleDateString('es-PE', { weekday: 'long' })
  const month = date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '').toLowerCase()
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date.getDate()} ${month}`
}

export function greeting(date) {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// "hoy, 16:20", "ayer, 09:05" o "12 dic"
export function formatWhen(value, now = new Date()) {
  if (!value) return ''
  const date = new Date(value)
  const time = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)
  if (days === 0) return `hoy, ${time}`
  if (days === 1) return `ayer, ${time}`
  return formatShortDate(value)
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

// 3 → "03", como en los números grandes del diseño
export const pad = (count) => String(count).padStart(2, '0')

export const plural = (count, one, many) => (count === 1 ? one : many)

export const sumBy = (items, pick) => items.reduce((total, item) => total + (Number(pick(item)) || 0), 0)

// "#CT-0042": código del contrato, igual que en la web
export const contractCode = (id) => `#CT-${String(id).padStart(4, '0')}`
