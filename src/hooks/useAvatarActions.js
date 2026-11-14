import { useState } from 'react'
import { Alert, Platform } from 'react-native'
import { useAuth } from './useAuth'
import { userService } from '../services/userService'
import { pickAvatar } from '../utils/avatar'
import { confirmAlert } from '../utils/confirmAlert'
import { errorMessage } from '../utils/errorMessage'

// En la web, Alert.alert no muestra el mensaje con botones, así que se usa window.alert
function notify(title, message) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`)
  else Alert.alert(title, message)
}

// Cambiar o quitar la foto de perfil de la persona con sesión desde la foto misma: al tocarla se abre un menú.
// Mientras sube, preview tiene la foto nueva para mostrarla al instante.
export function useAvatarActions() {
  const { user, updateUser } = useAuth()
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)

  const choose = async () => {
    try {
      const uri = await pickAvatar()
      if (!uri) return
      setPreview(uri)
      setBusy(true)
      await updateUser(await userService.uploadAvatar(uri))
    } catch (err) {
      const message = err?.response || err?.code === 'ERR_OFFLINE' ? errorMessage(err) : 'Prueba con otra foto.'
      notify('No pudimos cambiar tu foto', message)
    } finally {
      setPreview(null)
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!(await confirmAlert('¿Quitar tu foto?', 'Se volverán a ver tus iniciales.', 'Quitar'))) return
    setBusy(true)
    try {
      await updateUser(await userService.deleteAvatar())
    } catch (err) {
      notify('No pudimos quitar tu foto', errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const openMenu = () => {
    if (busy) return
    if (user.rol === 'ADMIN') {
      notify('Foto de DEVUTEC', 'La cuenta de administrador usa la foto de DEVUTEC y no se puede cambiar.')
      return
    }
    // En la web no hay menú de opciones: se abre directo el selector de fotos
    if (Platform.OS === 'web') {
      choose()
      return
    }
    Alert.alert(
      'Foto de perfil',
      'Se recorta cuadrada y se ve en tu perfil.',
      [
        { text: user.avatarUrl ? 'Cambiar foto' : 'Elegir de la galería', onPress: choose },
        user.avatarUrl && { text: 'Quitar foto', style: 'destructive', onPress: remove },
        { text: 'Cancelar', style: 'cancel' },
      ].filter(Boolean),
      { cancelable: true },
    )
  }

  return { preview, busy, openMenu }
}
