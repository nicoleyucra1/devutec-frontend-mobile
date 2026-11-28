const count = (n, one, many) => `${n} ${n === 1 ? one : many}`

// La frase del resumen en palabras simples (igual que en la web):
// "En los últimos 30 días 120 personas visitaron tu web, 9 te contactaron y llegaron 4 pedidos."
export function summarySentence(summary) {
  if (!summary) return ''
  const parts = [`${count(summary.visits, 'persona visitó', 'personas visitaron')} tu web`]
  if (summary.contacts > 0) parts.push(count(summary.contacts, 'te contactó', 'te contactaron'))
  if (summary.orders > 0) parts.push(summary.orders === 1 ? 'llegó 1 pedido' : `llegaron ${summary.orders} pedidos`)
  if (summary.reservations > 0) parts.push(summary.reservations === 1 ? 'hubo 1 reserva' : `hubo ${summary.reservations} reservas`)
  const text = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}` : parts[0]
  return `En los últimos 30 días ${text}.`
}

// Orden en "Mis métricas": primero las webs con plan pagado, luego prueba gratis, bloqueadas y sin datos
export function siteRank(data) {
  const plan = data.access?.plan
  if (data.enabled && (plan === 'PRO' || plan === 'BASIC')) return 0
  if (data.enabled && data.integrated && !data.access?.locked) return 1
  if (data.enabled && data.access?.locked) return 2
  if (data.enabled) return 3
  return 4
}
