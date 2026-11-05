import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Stack, useRouter } from 'expo-router'
import ManualProfileEntry from '../src/components/ManualProfileEntry'
import PermissionNotice from '../src/components/PermissionNotice'
import { parseProfileLink } from '../src/utils/profileLink'
import { colors } from '../src/theme'

// Tiempo que el mensaje de "QR no válido" queda en pantalla antes de volver a escanear
const RETRY_DELAY_MS = 2000

// Escáner del QR del perfil de un freelancer con la cámara trasera
export default function ScanScreen() {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  // null mientras se comprueba; false si el dispositivo no tiene cámara (por ejemplo, una compu sin webcam)
  const [cameraAvailable, setCameraAvailable] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [invalidCode, setInvalidCode] = useState(false)
  // La cámara avisa varias veces por segundo mientras ve el mismo QR: este candado evita abrir el perfil dos veces
  const scanLocked = useRef(false)
  const unlockTimer = useRef(null)

  useEffect(() => {
    // isAvailableAsync no existe en Android y ahí lanza un error: en ese caso se asume que hay cámara.
    // Si igual falla al abrirse, onMountError lo detecta más abajo.
    CameraView.isAvailableAsync()
      .then(setCameraAvailable)
      .catch(() => setCameraAvailable(true))
    return () => clearTimeout(unlockTimer.current)
  }, [])

  const openProfile = (userId) => router.replace(`/freelancers/${userId}`)

  const handleScanned = ({ data }) => {
    if (scanLocked.current) return
    scanLocked.current = true

    const userId = parseProfileLink(data)
    if (userId) {
      openProfile(userId)
      return
    }

    setInvalidCode(true)
    unlockTimer.current = setTimeout(() => {
      scanLocked.current = false
      setInvalidCode(false)
    }, RETRY_DELAY_MS)
  }

  const renderCamera = () => {
    if (!permission || cameraAvailable === null) {
      return <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />
    }

    if (!cameraAvailable || cameraError) {
      return (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>No pudimos usar la cámara</Text>
          <Text style={styles.noticeText}>
            {cameraError ?? 'Este dispositivo no tiene una cámara disponible.'} Puedes ingresar el enlace del perfil
            abajo.
          </Text>
        </View>
      )
    }

    if (!permission.granted) {
      return (
        <PermissionNotice
          icon="camera-outline"
          title="Necesitamos tu cámara"
          message="La usamos solo para leer el código QR del perfil de un freelancer. No guardamos fotos."
          canAskAgain={permission.canAskAgain}
          onRequest={requestPermission}
        />
      )
    }

    return (
      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScanned}
          onMountError={({ message }) => setCameraError(message || 'La cámara no se pudo iniciar.')}
        />
        <View style={styles.frame} pointerEvents="none" />
        <Text style={[styles.hint, invalidCode && styles.hintError]}>
          {invalidCode ? 'Ese QR no es de un perfil de DevUTEC' : 'Apunta al QR del perfil del freelancer'}
        </Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Escanear QR', headerBackTitle: 'Volver' }} />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {renderCamera()}
          <ManualProfileEntry onSubmit={openProfile} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24 },
  loading: { marginVertical: 48 },
  cameraBox: {
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 210,
    height: 210,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 16,
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    color: colors.white,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '600',
  },
  hintError: { backgroundColor: colors.error },
  notice: { backgroundColor: colors.errorLight, borderRadius: 12, padding: 16 },
  noticeTitle: { color: colors.error, fontWeight: '700' },
  noticeText: { color: colors.error, marginTop: 4 },
})
