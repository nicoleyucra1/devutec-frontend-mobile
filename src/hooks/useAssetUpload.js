import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { assetService } from '../services/assetService'
import { errorMessage } from '../utils/errorMessage'

export const MAX_IMAGES = 6
const MAX_BYTES = 5 * 1024 * 1024

// Elige fotos de la galería (logo, productos, el local) y las sube. Se pasan a JPEG de máximo 2000 px:
// así no llegan en HEIC (iPhone) y pesan menos. assets y onChange vienen de la pantalla.
export function useAssetUpload(assets, onChange) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [error, setError] = useState(null)

  const pickAndUpload = async () => {
    setError(null)
    const images = assets.filter((asset) => asset.kind === 'IMAGE').length
    const free = MAX_IMAGES - images
    if (free <= 0) {
      setError(`Puedes adjuntar hasta ${MAX_IMAGES} imágenes.`)
      return []
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: free,
      quality: 1,
    })
    if (result.canceled || !result.assets?.length) return []

    setUploading(true)
    const added = []
    let current = assets
    try {
      for (const [index, picked] of result.assets.slice(0, free).entries()) {
        try {
          const width = Math.min(2000, picked.width || 2000)
          const rendered = await ImageManipulator.manipulate(picked.uri).resize({ width }).renderAsync()
          const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 })
          const base = (picked.fileName ?? `foto-${index + 1}`).replace(/\.[^.]+$/, '')
          const asset = await assetService.upload(saved.uri, `${base}.jpg`)
          added.push(asset)
          current = [...current, asset]
          onChange(current)
        } catch (err) {
          setError(errorMessage(err))
        }
      }
    } finally {
      setUploading(false)
    }
    return added
  }

  // 1 PDF de máximo 2 páginas (carta, catálogo). El backend revisa las páginas y le quita lo que se puede ejecutar
  const pickPdfAndUpload = async () => {
    setError(null)
    if (assets.some((asset) => asset.kind === 'PDF')) {
      setError('Puedes adjuntar solo 1 PDF. Quita el anterior para subir otro.')
      return []
    }
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false })
    if (result.canceled || !result.assets?.length) return []
    const picked = result.assets[0]
    if (picked.size && picked.size > MAX_BYTES) {
      setError('El archivo puede pesar como máximo 5 MB.')
      return []
    }
    setUploading(true)
    try {
      const name = /\.pdf$/i.test(picked.name ?? '') ? picked.name : `${picked.name ?? 'documento'}.pdf`
      const asset = await assetService.upload(picked.uri, name, 'application/pdf')
      onChange([...assets, asset])
      return [asset]
    } catch (err) {
      setError(errorMessage(err))
      return []
    } finally {
      setUploading(false)
    }
  }

  const remove = async (asset) => {
    setError(null)
    setRemoving(asset.id)
    try {
      await assetService.remove(asset.id)
      onChange(assets.filter((item) => item.id !== asset.id))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setRemoving(null)
    }
  }

  return { pickAndUpload, pickPdfAndUpload, remove, uploading, removing, error }
}
