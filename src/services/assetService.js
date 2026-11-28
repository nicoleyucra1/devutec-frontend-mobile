import { Platform } from 'react-native'
import api, { API_URL } from './api'
import { tokenStorage } from '../utils/tokenStorage'

// Archivos del negocio (logo, fotos y 1 PDF). El backend revisa y limpia cada archivo.
// Un asset: { id, kind: 'IMAGE' | 'PDF', fileName, contentType, sizeBytes, pages, summary, createdAt }
// En la app se suben fotos (ya pasadas a JPEG); el PDF se sube desde la web.
export const assetService = {
  upload: async (uri, name) => {
    const form = new FormData()
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob()
      form.append('file', blob, name)
    } else {
      form.append('file', { uri, name, type: 'image/jpeg' })
    }
    const config = Platform.OS === 'web' ? {} : { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (body) => body }
    const { data } = await api.post('/project-assets', form, config)
    return data
  },

  remove: (id) => api.delete(`/project-assets/${id}`),

  attach: (projectId, assetIds) => api.post(`/projects/${projectId}/assets`, { assetIds }).then((res) => res.data),

  // { canDownload, images, pdfs, files }. Sin permiso solo llegan los conteos.
  list: (projectId, { signal } = {}) => api.get(`/projects/${projectId}/assets`, { signal }).then((res) => res.data),

  // Para mostrar una imagen en la app: la dirección y la sesión (no es un link público)
  imageSource: (asset) => ({
    uri: `${API_URL}/project-assets/${asset.id}/file`,
    headers: { Authorization: `Bearer ${tokenStorage.getAccessToken()}` },
  }),
}
