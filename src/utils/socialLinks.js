// Redes del negocio del cliente, en el orden en que se muestran. key es el nombre del campo en el backend.
export const SOCIAL_NETWORKS = [
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', placeholder: '@tunegocio' },
  { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', placeholder: 'facebook.com/tunegocio' },
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', placeholder: '@tunegocio' },
  { key: 'sitioWeb', label: 'Página web', icon: 'globe-outline', placeholder: 'tunegocio.com' },
]

// El backend siempre guarda el link completo (https://instagram.com/pizzeria). Para mostrarlo se acorta:
// "@pizzeria" en Instagram y TikTok, y el resto sin https:// ni www.
export function shortLink(key, url) {
  if (!url) return ''
  const clean = url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  if (key === 'instagram' || key === 'tiktok') {
    const handle = clean.split('/')[1]
    if (handle) return handle.startsWith('@') ? handle : `@${handle}`
  }
  return clean
}

// Redes que la persona sí llenó, con su link
export function filledLinks(redes) {
  if (!redes) return []
  return SOCIAL_NETWORKS.filter((network) => redes[network.key]).map((network) => ({ ...network, url: redes[network.key] }))
}
