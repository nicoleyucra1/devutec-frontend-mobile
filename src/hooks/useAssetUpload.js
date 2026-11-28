import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { assetService } from '../services/assetService'
import { errorMessage } from '../utils/errorMessage'

export const MAX_IMAGES = 6

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

  return { pickAndUpload, remove, uploading, removing, error }
}
