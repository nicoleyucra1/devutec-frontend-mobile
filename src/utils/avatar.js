import { Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { API_URL } from '../services/api'

// El backend manda la foto como ruta (/api/v1/users/5/avatar?v=...). Se completa con el dominio de la API
// (la compu en desarrollo, devutec.duckdns.org en producción).
export function avatarSrc(path) {
  if (!path) return null
  if (/^(https?:|file:|blob:|data:)/.test(path)) return path
  const origin = API_URL.match(/^https?:\/\/[^/]+/)?.[0]
  return origin ? origin + path : null
}

const OUTPUT_SIZE = 800

// Abre la galería con el recorte cuadrado del sistema y deja la foto lista para subir: 800 × 800 en JPEG.
// Pasarla a JPEG evita que llegue en HEIC (el formato de las fotos del iPhone), que el backend no acepta.
// Devuelve null si la persona cerró la galería sin elegir.
export async function pickAvatar() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  })
  if (result.canceled || !result.assets?.length) return null

  const asset = result.assets[0]
  const width = Math.min(OUTPUT_SIZE, asset.width || OUTPUT_SIZE)
  const rendered = await ImageManipulator.manipulate(asset.uri).resize({ width }).renderAsync()
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 })
  return saved.uri
}

// Arma el campo "file" del formulario. En el celular se manda la ruta del archivo;
// en la versión web de Expo hay que mandar el archivo en sí.
export async function avatarFormData(uri) {
  const form = new FormData()
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob()
    form.append('file', blob, 'foto-perfil.jpg')
  } else {
    form.append('file', { uri, name: 'foto-perfil.jpg', type: 'image/jpeg' })
  }
  return form
}
