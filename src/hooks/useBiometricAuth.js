import { useCallback, useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

const { AuthenticationType, SecurityLevel } = LocalAuthentication

// Mensajes para cuando la verificación no se completa. Si el usuario cancela no se muestra nada.
const ERROR_MESSAGES = {
  lockout: 'Hubo demasiados intentos fallidos. Desbloquea tu celular e inténtalo otra vez.',
  authentication_failed: 'No pudimos verificar tu identidad. Inténtalo otra vez.',
  timeout: 'La verificación tardó demasiado. Inténtalo otra vez.',
}
const CANCEL_ERRORS = ['user_cancel', 'system_cancel', 'app_cancel']

// Nombre del método que verá el usuario, según lo que tenga configurado su celular
function methodLabel(level, types) {
  if (level === SecurityLevel.NONE) return 'Confirmación'
  if (level === SecurityLevel.SECRET) return 'Código del celular'
  if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) return Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento facial'
  if (types.includes(AuthenticationType.FINGERPRINT)) return 'Huella digital'
  return 'Biometría'
}

// Pregunta "¿Seguro?" con dos botones. Alert.alert no muestra botones en la web, así que ahí se usa window.confirm.
function askConfirmation(title, message, confirmLabel) {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`))
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    )
  })
}

// Confirma una acción sensible (por ejemplo liberar un pago) con la biometría del celular.
// Si el celular no tiene biometría, usa su código o PIN. Si no tiene ningún bloqueo (o es la web),
// pide una confirmación normal para que la acción siga siendo posible.
//
// Uso:
//   const { confirm, label } = useBiometricAuth()
//   const result = await confirm({ title: 'Liberar pago', message: 'Se pagarán S/ 300 al freelancer' })
//   if (result.ok) await contractService.confirm(id)
//   else if (result.error) setError(result.error)
export function useBiometricAuth() {
  const [status, setStatus] = useState({ checking: true, level: SecurityLevel.NONE, label: 'Confirmación' })

  useEffect(() => {
    let active = true
    Promise.all([
      LocalAuthentication.getEnrolledLevelAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ])
      .catch(() => [SecurityLevel.NONE, []])
      .then(([level, types]) => {
        if (active) setStatus({ checking: false, level, label: methodLabel(level, types) })
      })
    return () => {
      active = false
    }
  }, [])

  // Devuelve { ok: true } si se confirmó, o { ok: false, error } con un mensaje (error es null si el usuario canceló)
  const confirm = useCallback(
    async ({ title, message = '', confirmLabel = 'Confirmar' }) => {
      if (status.level === SecurityLevel.NONE) {
        const ok = await askConfirmation(title, message, confirmLabel)
        return { ok, error: null }
      }

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: title,
          promptSubtitle: message || undefined,
          cancelLabel: 'Cancelar',
          fallbackLabel: 'Usar código',
          disableDeviceFallback: false,
        })
        if (result.success) return { ok: true, error: null }
        if (CANCEL_ERRORS.includes(result.error)) return { ok: false, error: null }
        // Si la biometría se desactivó mientras la app estaba abierta, se pide confirmación normal
        if (['not_enrolled', 'not_available', 'passcode_not_set'].includes(result.error)) {
          const ok = await askConfirmation(title, message, confirmLabel)
          return { ok, error: null }
        }
        return { ok: false, error: ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.authentication_failed }
      } catch {
        return { ok: false, error: ERROR_MESSAGES.authentication_failed }
      }
    },
    [status.level],
  )

  return {
    checking: status.checking,
    label: status.label,
    usesDeviceSecurity: status.level !== SecurityLevel.NONE,
    confirm,
  }
}
