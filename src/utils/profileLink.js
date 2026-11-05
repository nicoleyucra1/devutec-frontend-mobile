// El QR del perfil guarda un enlace con el esquema de la app (app.json → "scheme": "devutec").
// Así, en la app instalada, la cámara del celular también abre el perfil directamente.
const PREFIX = 'devutec://freelancers/'

export function buildProfileLink(userId) {
  return `${PREFIX}${userId}`
}

// Devuelve el id de usuario del perfil, o null si el texto no es un perfil de DevUTEC.
// Acepta el enlace del QR, la URL del perfil en la web (.../freelancers/49) o solo el número.
export function parseProfileLink(text) {
  const value = String(text ?? '').trim()
  const match = value.match(/^(\d+)$/) ?? value.match(/^(?:devutec:\/\/|https?:\/\/[^/\s]+\/)freelancers\/(\d+)\/?(?:[?#]\S*)?$/)
  const userId = match ? Number(match[1]) : NaN
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null
}
