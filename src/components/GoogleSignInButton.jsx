import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { Ionicons } from '@expo/vector-icons'
import PrimaryButton from './PrimaryButton'
import { useAuth } from '../hooks/useAuth'
import { useTheme, useThemedStyles } from '../hooks/useTheme'
import { errorMessage } from '../utils/errorMessage'
import PropTypes from 'prop-types'

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

// El inicio con Google usa código nativo: funciona en el APK (EAS), pero no en Expo Go ni en la versión web.
// Por eso la librería se carga solo cuando se puede usar; si no, el botón no aparece y la app sigue igual.
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

const google = loadGoogleSignin()

const ROLES = [
  { value: 'CLIENT', title: 'Soy cliente', detail: 'Publico proyectos' },
  { value: 'FREELANCER', title: 'Soy freelancer', detail: 'Busco proyectos' },
]

// Botón "Continuar con Google". Si la cuenta ya existe, inicia sesión; si es nueva, pregunta el rol y la crea.
// En el registro se pasa el rol ya elegido, así no se vuelve a preguntar.
export default function GoogleSignInButton({ rol: presetRol }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const { loginWithGoogle } = useAuth()
  const [pendingToken, setPendingToken] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!google) return null
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = google

  // Al haber sesión, el layout raíz cambia solo a las pestañas
  const submit = async (idToken, rol = presetRol) => {
    setError(null)
    setLoading(true)
    try {
      await loginWithGoogle(rol ? { idToken, rol } : { idToken })
    } catch (err) {
      if (err.response?.status === 422) {
        // Cuenta nueva: falta elegir si es cliente o freelancer
        setPendingToken(idToken)
      } else {
        setPendingToken(null)
        setError(err.response?.status === 401 ? err.response.data?.message ?? 'No se pudo validar tu cuenta de Google' : errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePress = async () => {
    setError(null)
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const response = await GoogleSignin.signIn()
      if (!isSuccessResponse(response)) return // el usuario cerró la ventana de Google
      const idToken = response.data.idToken
      // Se cierra la sesión de Google en el celular para que la próxima vez se pueda elegir otra cuenta
      GoogleSignin.signOut().catch(() => {})
      if (!idToken) {
        setError('Google no devolvió los datos de tu cuenta. Intenta de nuevo')
        return
      }
      await submit(idToken)
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) return
      if (isErrorWithCode(err) && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Necesitas Google Play Services actualizado para entrar con Google')
      } else {
        setError('No se pudo abrir Google. Intenta de nuevo o entra con tu correo')
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>o</Text>
        <View style={styles.line} />
      </View>

      {pendingToken ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¿Cómo vas a usar DEVUTEC?</Text>
          <Text style={styles.cardText}>Es tu primera vez con esta cuenta de Google. Elige un rol para terminar.</Text>
          <View style={styles.roles}>
            {ROLES.map((role) => (
              <Pressable
                key={role.value}
                disabled={loading}
                onPress={() => submit(pendingToken, role.value)}
                style={({ pressed }) => [styles.role, (pressed || loading) && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.cardText}>{role.detail}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setPendingToken(null)} hitSlop={8}>
            <Text style={styles.link}>Usar otra cuenta</Text>
          </Pressable>
        </View>
      ) : (
        <PrimaryButton
          variant="secondary"
          title="Continuar con Google"
          onPress={handlePress}
          loading={loading}
          icon={<Ionicons name="logo-google" size={18} color={colors.text} />}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  container: { gap: 12, marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  card: { gap: 8, padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  cardText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  roles: { flexDirection: 'row', gap: 8, marginTop: 4 },
  role: { flex: 1, gap: 2, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder },
  roleTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  pressed: { opacity: 0.7 },
  link: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textDecorationLine: 'underline', marginTop: 4 },
  error: {
    fontFamily: fonts.medium,
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: 12,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
})

GoogleSignInButton.propTypes = {
  rol: PropTypes.oneOf(['CLIENT', 'FREELANCER']),
}
