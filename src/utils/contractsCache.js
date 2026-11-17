// Últimos contratos que llegaron bien, guardados en memoria mientras la app está abierta.
// Si después falla la conexión, la pestaña Contratos los sigue mostrando con el aviso "Sin conexión".
let saved = null

export const contractsCache = {
  save(contracts) {
    saved = { contracts, savedAt: Date.now() }
  },
  get() {
    return saved
  },
}

// "hace 5 min", "hace un momento", "hace 2 h"
export function savedAgo(savedAt, now = Date.now()) {
  const minutes = Math.floor((now - savedAt) / 60_000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  return `hace ${Math.floor(minutes / 60)} h`
}
