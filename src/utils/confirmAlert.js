import { Alert, Platform } from 'react-native'

// Pregunta "¿Seguro?" con Cancelar y un botón de confirmar. Devuelve true si confirmó.
// En la web, Alert.alert no muestra botones, así que ahí se usa window.confirm.
export function confirmAlert(title, message, confirmLabel = 'Confirmar') {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`))
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    )
  })
}