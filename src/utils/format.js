// Formatos para mostrar dinero y fechas igual que en la web
const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function formatMoney(value) {
  return value === null || value === undefined ? '—' : money.format(value)
}

export function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}