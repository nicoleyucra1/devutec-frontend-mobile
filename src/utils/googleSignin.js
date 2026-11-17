import { Platform } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

// El inicio con Google usa código nativo: funciona en el APK (EAS), pero no en Expo Go ni en la versión web.
// Por eso la librería se carga solo cuando se puede usar; si no, queda en null y los botones de Google no aparecen.
function loadGoogleSignin() {
  if (!WEB_CLIENT_ID || Platform.OS === 'web') return null
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null
  try {
    const module = require('@react-native-google-signin/google-signin')
    // webClientId hace que Google devuelva un idToken pensado para nuestro backend
    module.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID })
    return module
  } catch {
    return null
  }
}

export const google = loadGoogleSignin()

// Abre la ventana de Google y devuelve el idToken de la cuenta elegida, o null si la persona la cerró.
// Lanza un Error con un mensaje para mostrar si algo falla.
export async function pickGoogleIdToken() {
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = google
  let response
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    response = await GoogleSignin.signIn()
  } catch (err) {
    if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) return null
    if (isErrorWithCode(err) && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Necesitas Google Play Services actualizado para usar Google')
    }
    throw new Error('No se pudo abrir Google. Intenta de nuevo')
  }
  if (!isSuccessResponse(response)) return null // la persona cerró la ventana de Google
  // Se cierra la sesión de Google en el celular para que la próxima vez se pueda elegir otra cuenta
  GoogleSignin.signOut().catch(() => {})
  if (!response.data.idToken) throw new Error('Google no devolvió los datos de tu cuenta. Intenta de nuevo')
  return response.data.idToken
}
