import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import BottomSheet from '../BottomSheet'
import Money from '../Money'
import PrimaryButton from '../PrimaryButton'
import api from '../../services/api'
import { authService } from '../../services/authService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'
import { contractCode, formatBudget } from '../../utils/format'
import { google, pickGoogleIdToken } from '../../utils/googleSignin'
import { idType } from '../../utils/propShapes'

// "Liberar pago" (mockup): resumen de a quién y cuánto se paga, y la confirmación de identidad.
// Con huella, Face ID o código del celular se confirma con eso; si el celular no tiene ninguno (o es la web),
// se pide la contraseña de DEVUTEC y se verifica con el login antes de liberar. Quien creó su cuenta con Google
// no tiene contraseña, así que también puede confirmar eligiendo de nuevo su cuenta de Google.
export default function ReleaseSheet({ contract, email, biometric, visible, onClose, onRelease }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [password, setPassword] = useState('')
  // Con qué se está confirmando ('password' o 'google'), para mostrar el cargando en ese botón
  const [checking, setChecking] = useState(null)
  const [error, setError] = useState(null)
  const amount = formatBudget(contract.amount)

  const releaseWithDevice = async () => {
    setError(null)
    const result = await biometric.confirm({
      title: 'Liberar pago',
      message: `Se pagarán ${amount} a ${contract.freelancerName}`,
      confirmLabel: 'Liberar pago',
    })
    if (result.ok) onRelease()
    else if (result.error) setError(result.error)
  }

  const releaseWithGoogle = async () => {
    setError(null)
    let idToken
    try {
      idToken = await pickGoogleIdToken()
    } catch (err) {
      setError(err.message)
      return
    }
    if (!idToken) return // cerró la ventana de Google
    setChecking('google')
    try {
      await authService.confirmGoogle(idToken)
      onRelease()
    } catch (err) {
      setError(err.response?.status === 403 ? 'Elige la cuenta de Google con la que iniciaste sesión.' : errorMessage(err))
    } finally {
      setChecking(null)
    }
  }

  const releaseWithPassword = async () => {
    setChecking('password')
    setError(null)
    try {
      // El login solo se usa para comprobar la contraseña: la respuesta no se guarda y la sesión sigue igual
      await api.post('/auth/login', { email, password })
      setPassword('')
      onRelease()
    } catch (err) {
      setError(err.response?.status === 401 ? 'La contraseña no es correcta.' : errorMessage(err))
    } finally {
      setChecking(null)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} busy={Boolean(checking)}>
      <Text style={styles.kicker}>LIBERAR PAGO</Text>
      <Money value={contract.amount} style={styles.amount} centsStyle={styles.cents} />
      <Text style={styles.to}>
        a <Text style={styles.strong}>{contract.freelancerName}</Text> · {contract.projectTitle}
      </Text>

      <View style={styles.rows}>
        <Row label="Desde" value="Garantía DEVUTEC" />
        <Row label="Comisión" value={formatBudget(0)} />
        <Row label="Contrato" value={contractCode(contract.id)} />
      </View>

      {biometric.usesDeviceSecurity ? (
        <PrimaryButton title={`Liberar con ${biometric.label}`} onPress={releaseWithDevice} style={styles.button} />
      ) : (
        <>
          <View style={styles.notice}>
            <Ionicons name="scan-outline" size={20} color={colors.pending} />
            <Text style={styles.noticeText}>
              Este dispositivo no tiene huella ni Face ID. Confirma con tu contraseña{google ? ' o con Google' : ''}.
            </Text>
          </View>
          <Text style={styles.label}>Contraseña de DEVUTEC</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setError(null)
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            placeholder="Tu contraseña"
            placeholderTextColor={colors.muted}
            style={[styles.input, error && styles.inputError]}
            onSubmitEditing={password ? releaseWithPassword : undefined}
          />
          <PrimaryButton
            title={`Confirmar y liberar ${amount}`}
            onPress={releaseWithPassword}
            loading={checking === 'password'}
            disabled={!password || Boolean(checking)}
            style={styles.button}
          />
          {google ? (
            <PrimaryButton
              variant="secondary"
              title="Confirmar con Google"
              onPress={releaseWithGoogle}
              loading={checking === 'google'}
              disabled={Boolean(checking)}
              icon={<Ionicons name="logo-google" size={18} color={colors.text} />}
              style={styles.googleButton}
            />
          ) : null}
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={onClose} disabled={Boolean(checking)} accessibilityRole="button" style={styles.cancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </BottomSheet>
  )
}

function Row({ label, value }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

ReleaseSheet.propTypes = {
  contract: PropTypes.shape({
    id: idType.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    freelancerName: PropTypes.string,
    projectTitle: PropTypes.string,
  }).isRequired,
  email: PropTypes.string,
  biometric: PropTypes.shape({
    usesDeviceSecurity: PropTypes.bool,
    label: PropTypes.string,
    confirm: PropTypes.func.isRequired,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRelease: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts, radius }) => ({
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent, marginTop: 6 },
  amount: { fontFamily: fonts.bold, fontSize: 44, letterSpacing: -2.2, color: colors.text, marginTop: 6 },
  cents: { color: colors.muted },
  to: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 4 },
  strong: { fontFamily: fonts.bold, color: colors.text },
  rows: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, marginTop: 18, paddingVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  rowValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.pendingLight,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
  },
  noticeText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.pending },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.error },
  button: { marginTop: 14 },
  googleButton: { marginTop: 10 },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8, marginTop: 12 },
  cancel: { alignSelf: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.muted },
})
