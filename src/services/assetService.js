import { Platform } from 'react-native'
import * as Sharing from 'expo-sharing'
import { File, Paths } from 'expo-file-system'
import api, { API_URL } from './api'
import { tokenStorage } from '../utils/tokenStorage'

// Archivos del negocio (logo, fotos y 1 PDF). El backend revisa y limpia cada archivo.
// Un asset: { id, kind: 'IMAGE' | 'PDF', fileName, contentType, sizeBytes, pages, summary, createdAt }
// En la app se suben fotos (ya pasadas a JPEG) y 1 PDF de máximo 2 páginas.
export const assetService = {
  // type: image/jpeg (fotos) o application/pdf
  upload: async (uri, name, type = 'image/jpeg') => {
    const form = new FormData()
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob()
      form.append('file', blob, name)
    } else {
      form.append('file', { uri, name, type })
    }
    const config = Platform.OS === 'web' ? {} : { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (body) => body }
    const { data } = await api.post('/project-assets', form, config)
    return data
  },

  remove: (id) => api.delete(`/project-assets/${id}`),

  attach: (projectId, assetIds) => api.post(`/projects/${projectId}/assets`, { assetIds }).then((res) => res.data),

  // { canDownload, images, pdfs, files }. Sin permiso solo llegan los conteos.
  list: (projectId, { signal } = {}) => api.get(`/projects/${projectId}/assets`, { signal }).then((res) => res.data),

  // Descarga el archivo con la sesión y abre el menú de compartir del celular (guardar en Archivos, WhatsApp,
  // Drive...). Siempre se baja como archivo: nunca se abre dentro de la app.
  download: async (asset) => {
    const url = `${API_URL}/project-assets/${asset.id}/file`
    const headers = { Authorization: `Bearer ${tokenStorage.getAccessToken()}` }
    if (Platform.OS === 'web') {
      const blob = await (await fetch(url, { headers })).blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = asset.fileName
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      return
    }
    const file = await File.downloadFileAsync(url, new File(Paths.cache, `${asset.id}-${asset.fileName}`), { headers, idempotent: true })
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: asset.contentType, dialogTitle: asset.fileName })
    }
  },

  // Para mostrar una imagen en la app: la dirección y la sesión (no es un link público)
  imageSource: (asset) => ({
    uri: `${API_URL}/project-assets/${asset.id}/file`,
    headers: { Authorization: `Bearer ${tokenStorage.getAccessToken()}` },
  }),
}
