import { useEffect, useState } from 'react'
import { Alert, Platform, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import PrimaryButton from '../PrimaryButton'
import { verificationService } from '../../services/verificationService'
import { useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'

const STATES = {
  NONE: {
    kicker: 'VERIFICA TU CARNET',
    title: 'Sube una foto de tu carnet universitario',
    text: 'Es la segunda verificación, además de tu correo .edu.pe. Con el carnet aprobado, tu perfil muestra «Carnet verificado» y los clientes confían más en ti.',
    tone: 'neutral',
  },
  PENDING: { kicker: 'EN REVISIÓN', title: 'Recibimos tu carnet', text: 'Lo revisamos pronto. Mientras tanto puedes seguir postulando.', tone: 'pending' },
  APPROVED: { kicker: 'VERIFICADO', title: '🪪 Tu carnet está verificado', text: 'Tu perfil ya muestra la insignia «Carnet verificado».', tone: 'success' },
  REJECTED: { kicker: 'HAY QUE SUBIRLO DE NUEVO', title: 'No pudimos aprobar tu carnet', text: '', tone: 'danger' },
}

// Segunda verificación del estudiante (igual que en la web): toma o elige la foto del carnet y el admin la revisa.
// La foto es privada: solo la ven el estudiante y el admin.
export default function CarnetCard() {
  const styles = useThemedStyles(createStyles)
  const [status, setStatus] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    verificationService
      .getMyStatus()
      .then((data) => active && setStatus(data))
      .catch(() => active && setStatus(null))
    return () => {
      active = false
    }
  }, [])

  if (!status) return null
  const key = status.status ?? 'NONE'
  const view = STATES[key] ?? STATES.NONE
  const canUpload = key === 'NONE' || key === 'REJECTED'

  const send = async (uri) => {
    setUploading(true)
    setError(null)
    try {
      // JPEG de máximo 1600 px: no llega en HEIC (iPhone) y pesa menos de 5 MB
      const rendered = await ImageManipulator.manipulate(uri).resize({ width: 1600 }).renderAsync()
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 })
      setStatus(await verificationService.uploadCarnet(saved.uri))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const pick = async (fromCamera) => {
    const options = { mediaTypes: ['images'], quality: 1 }
    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        setError('Necesitamos la cámara para la foto del carnet. También puedes elegirla de tu galería.')
        return
      }
    }
    const result = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options)
    if (!result.canceled && result.assets?.length) send(result.assets[0].uri)
  }

  const choose = () =>
    // En la versión web de la app no hay avisos con botones: se elige el archivo directamente
    Platform.OS === 'web'
      ? pick(false)
      : Alert.alert('Foto del carnet', 'Que se vean tu nombre, tu universidad y tu código.', [
      { text: 'Tomar foto', onPress: () => pick(true) },
      { text: 'Elegir de la galería', onPress: () => pick(false) },
      { text: 'Cancelar', style: 'cancel' },
    ])

  return (
    <View style={[styles.card, styles[view.tone]]}>
      <Text style={styles.kicker}>{view.kicker}</Text>
      <Text style={styles.title}>{view.title}</Text>
      <Text style={styles.text}>
        {key === 'REJECTED' ? `Motivo: ${status.rejectReason}. Sube otra foto, nítida y con tus datos visibles.` : view.text}
      </Text>
      <Text style={styles.small}>
        {status.universityEmail ? '🎓 Tu correo universitario ya está verificado.' : 'Tu cuenta no usa un correo .edu.pe.'}
      </Text>
      {canUpload ? (
        <>
          <PrimaryButton
            title={uploading ? 'Subiendo…' : key === 'REJECTED' ? 'Subir otra foto' : 'Subir foto del carnet'}
            loading={uploading}
            onPress={choose}
          />
          <Text style={styles.small}>JPG o PNG, hasta 5 MB. Solo lo ve el equipo de DEVUTEC.</Text>
        </>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  neutral: { backgroundColor: colors.card, borderColor: colors.border },
  pending: { backgroundColor: colors.pendingLight, borderColor: colors.border },
  success: { backgroundColor: colors.card, borderColor: colors.accent },
  danger: { backgroundColor: colors.errorLight, borderColor: colors.border },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  title: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error },
})
