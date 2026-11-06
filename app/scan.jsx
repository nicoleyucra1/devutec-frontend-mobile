import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ManualProfileEntry from '../src/components/ManualProfileEntry'
import PermissionNotice from '../src/components/PermissionNotice'
import { useAuth } from '../src/hooks/useAuth'
import { useFreelancerProfile } from '../src/hooks/useFreelancerProfile'
import { parseProfileLink } from '../src/utils/profileLink'
import { darkColors, fonts, lightColors, radius } from '../src/theme'

// Tiempo que el mensaje de "QR no válido" queda en pantalla antes de volver a escanear
const RETRY_DELAY_MS = 2000
const FRAME_SIZE = 260
const BACKGROUND = '#121210'

function initials(name) {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// Línea lima que sube y baja dentro del recuadro mientras se busca un código
function ScanLine() {
  const position = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(position, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(position, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [position])

  const translateY = position.interpolate({ inputRange: [0, 1], outputRange: [FRAME_SIZE * 0.08, FRAME_SIZE * 0.88] })
  return <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
}

// Las cuatro esquinas del recuadro: lima mientras busca, verde al encontrar un perfil y rojo si el QR no sirve
function Frame({ color, scanning }) {
  const corner = { borderColor: color }
  return (
    <View style={styles.frame} pointerEvents="none">
      <View style={[styles.corner, styles.topLeft, corner]} />
      <View style={[styles.corner, styles.topRight, corner]} />
      <View style={[styles.corner, styles.bottomLeft, corner]} />
      <View style={[styles.corner, styles.bottomRight, corner]} />
      {scanning && <ScanLine />}
    </View>
  )
}

// Hoja que aparece al leer un QR válido: muestra a quién se escaneó antes de abrir su perfil
function FoundProfileSheet({ userId, bottomInset, onOpen, onRescan }) {
  const { data: profile, error, status, loading } = useFreelancerProfile(userId)
  const notFound = status === 404 || status === 400
  const study = profile?.egresado ? 'Egresado' : profile?.ciclo ? `Ciclo ${profile.ciclo}` : null
  const rating = profile?.calificacionPromedio ? `${Number(profile.calificacionPromedio).toFixed(1)} ★` : null

  return (
    <View style={[styles.sheet, { paddingBottom: bottomInset + 20 }]} accessibilityViewIsModal accessibilityLabel="Perfil detectado">
      <View style={styles.handle} />

      {loading && <ActivityIndicator style={styles.sheetLoading} color={lightColors.ink} />}

      {error && (
        <Text style={styles.sheetError}>
          {notFound ? 'Este QR es de un perfil que ya no existe.' : `No pudimos cargar el perfil. ${error}`}
        </Text>
      )}

      {profile && (
        <>
          <View style={styles.sheetIdentity}>
            <View style={styles.sheetAvatar}>
              <Text style={styles.sheetAvatarText}>{initials(profile.nombre)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.sheetName}>{profile.nombre}</Text>
              <Text style={styles.sheetMuted}>{[profile.universidad, study, rating].filter(Boolean).join(' · ')}</Text>
            </View>
          </View>
          <View style={styles.sheetRate}>
            <Text style={styles.sheetKicker}>TARIFA</Text>
            <Text style={styles.sheetRateValue}>
              {profile.tarifaHora !== null && profile.tarifaHora !== undefined ? (
                <>
                  S/ {Number(profile.tarifaHora).toFixed(2)}
                  <Text style={styles.sheetRateUnit}>/h</Text>
                </>
              ) : (
                'Por definir'
              )}
            </Text>
          </View>
          <Pressable onPress={onOpen} style={({ pressed }) => [styles.sheetPrimary, pressed && styles.pressed]}>
            <Text style={styles.sheetPrimaryText}>Ver perfil</Text>
          </Pressable>
        </>
      )}

      <Pressable onPress={onRescan} style={({ pressed }) => [styles.sheetSecondary, pressed && styles.pressed]}>
        <Text style={styles.sheetSecondaryText}>Escanear otro</Text>
      </Pressable>
    </View>
  )
}

// Escáner del QR del perfil de un freelancer con la cámara trasera. Siempre es oscuro, como una cámara.
export default function ScanScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [permission, requestPermission] = useCameraPermissions()
  // null mientras se comprueba; false si el dispositivo no tiene cámara (por ejemplo, una compu sin webcam)
  const [cameraAvailable, setCameraAvailable] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [invalidCode, setInvalidCode] = useState(false)
  const [foundId, setFoundId] = useState(null)
  const [torch, setTorch] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  // La cámara avisa varias veces por segundo mientras ve el mismo QR: este candado evita leerlo dos veces
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
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))

  const handleScanned = ({ data }) => {
    if (scanLocked.current) return
    scanLocked.current = true

    const userId = parseProfileLink(data)
    if (userId) {
      setManualOpen(false)
      setFoundId(userId)
      return
    }

    setInvalidCode(true)
    unlockTimer.current = setTimeout(() => {
      scanLocked.current = false
      setInvalidCode(false)
    }, RETRY_DELAY_MS)
  }

  const rescan = () => {
    setFoundId(null)
    scanLocked.current = false
  }

  const checking = !permission || cameraAvailable === null
  const unavailable = !checking && (!cameraAvailable || cameraError)
  const canScan = !checking && !unavailable && permission.granted

  let frameColor = darkColors.lime
  if (foundId) frameColor = lightColors.escrow
  else if (invalidCode) frameColor = darkColors.error

  let hint = 'Apunta al código QR'
  let subhint = 'de un perfil DevUTEC, dentro del recuadro'
  if (foundId) {
    hint = 'Perfil detectado'
    subhint = `devutec://freelancers/${foundId}`
  } else if (invalidCode) {
    hint = 'Ese QR no es de un perfil de DevUTEC'
    subhint = 'Prueba con otro código'
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {canScan && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScanned}
          onMountError={({ message }) => setCameraError(message || 'La cámara no se pudo iniciar.')}
        />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={close} accessibilityLabel="Cerrar escáner" style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topTitle}>Escanear perfil</Text>
        {canScan ? (
          <Pressable
            onPress={() => setTorch((on) => !on)}
            accessibilityLabel="Linterna"
            accessibilityState={{ selected: torch }}
            style={({ pressed }) => [styles.roundButton, torch && styles.torchOn, pressed && styles.pressed]}
          >
            <Ionicons name={torch ? 'flashlight' : 'flashlight-outline'} size={18} color={torch ? darkColors.ink : '#FFFFFF'} />
          </Pressable>
        ) : (
          <View style={styles.roundSpacer} />
        )}
      </View>

      {checking && <ActivityIndicator style={styles.loading} size="large" color={darkColors.lime} />}

      {!checking && !canScan && (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.noticeContent, { paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
          >
            {unavailable ? (
              <View>
                <View style={styles.noticeIcon}>
                  <Ionicons name="camera-outline" size={30} color={darkColors.lime} />
                </View>
                <Text style={styles.noticeKicker}>CÁMARA NO DISPONIBLE</Text>
                <Text style={styles.noticeTitle}>
                  No pudimos <Text style={styles.noticeHighlight}>abrir la cámara.</Text>
                </Text>
                <Text style={styles.noticeMessage}>{cameraError ?? 'Este dispositivo no tiene una cámara disponible.'}</Text>
              </View>
            ) : (
              <PermissionNotice
                icon="camera-outline"
                kicker={permission.canAskAgain ? 'PERMISO DE CÁMARA' : 'CÁMARA DESACTIVADA'}
                title={permission.canAskAgain ? 'Escanea perfiles con' : 'DevUTEC no puede'}
                highlight={permission.canAskAgain ? 'tu cámara.' : 'ver el código.'}
                message="Solo la usamos para leer el QR del perfil de un freelancer, mientras esta pantalla está abierta. No guardamos fotos."
                canAskAgain={permission.canAskAgain}
                onRequest={requestPermission}
              />
            )}
            <View style={styles.manualBottom}>
              <ManualProfileEntry onSubmit={openProfile} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {canScan && (
        <>
          <View style={styles.center} pointerEvents="none">
            <Frame color={frameColor} scanning={!foundId && !invalidCode} />
            <Text role="status" style={styles.hint}>
              {hint}
            </Text>
            <Text style={styles.subhint}>{subhint}</Text>
          </View>

          {!foundId && (
            <KeyboardAvoidingView
              style={styles.bottomArea}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              pointerEvents="box-none"
            >
              <View style={{ paddingBottom: insets.bottom + 24 }}>
                {manualOpen ? (
                  <View style={styles.manualPanel}>
                    <ManualProfileEntry onSubmit={openProfile} autoFocus />
                    <Pressable onPress={() => setManualOpen(false)} hitSlop={8}>
                      <Text style={styles.manualCancel}>Volver a la cámara</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.actions}>
                    {user?.rol === 'FREELANCER' && (
                      <Pressable
                        onPress={() => router.navigate('/profile')}
                        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                      >
                        <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.actionText}>Mi código</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => setManualOpen(true)}
                      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                    >
                      <Ionicons name="link-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.actionText}>Escribir enlace</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          )}

          {foundId && (
            <FoundProfileSheet
              userId={foundId}
              bottomInset={insets.bottom}
              onOpen={() => openProfile(foundId)}
              onRescan={rescan}
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  flex: { flex: 1 },
  loading: { marginTop: 160 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 5,
  },
  topTitle: { fontFamily: fonts.semibold, fontSize: 16, color: '#FFFFFF' },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundSpacer: { width: 44 },
  torchOn: { backgroundColor: darkColors.lime },
  center: { position: 'absolute', left: 0, right: 0, top: 150, alignItems: 'center' },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE },
  corner: { position: 'absolute', width: 44, height: 44, borderWidth: 0 },
  topLeft: { left: 0, top: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 18 },
  topRight: { right: 0, top: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 18 },
  bottomLeft: { left: 0, bottom: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 18 },
  bottomRight: { right: 0, bottom: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 18 },
  scanLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 0,
    height: 2,
    borderRadius: 2,
    backgroundColor: darkColors.lime,
    shadowColor: darkColors.lime,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  hint: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 28,
    textAlign: 'center',
    paddingHorizontal: 24,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  subhint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#D6D4CC',
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  bottomArea: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: { fontFamily: fonts.semibold, fontSize: 14, color: '#FFFFFF' },
  manualPanel: { backgroundColor: 'rgba(18,18,16,0.92)', borderRadius: radius.xl, padding: 16 },
  manualCancel: { fontFamily: fonts.semibold, fontSize: 13, color: darkColors.lime, textAlign: 'center', marginTop: 14 },
  noticeContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48 },
  noticeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeKicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.3, color: darkColors.lime, marginTop: 28 },
  noticeTitle: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 34, letterSpacing: -1.2, color: '#FFFFFF', marginTop: 10 },
  noticeHighlight: { fontFamily: fonts.serifItalic, color: darkColors.lime, letterSpacing: 0 },
  noticeMessage: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#AAA8A0', marginTop: 10 },
  manualBottom: { marginTop: 'auto', paddingTop: 32 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { width: 38, height: 5, borderRadius: 3, backgroundColor: '#D9D4CA', alignSelf: 'center', marginBottom: 16 },
  sheetLoading: { marginVertical: 24 },
  sheetError: { fontFamily: fonts.medium, fontSize: 15, color: lightColors.error, marginBottom: 12 },
  sheetIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: lightColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: { fontFamily: fonts.bold, fontSize: 15, color: lightColors.ink },
  sheetName: { fontFamily: fonts.semibold, fontSize: 17, color: lightColors.ink },
  sheetMuted: { fontFamily: fonts.regular, fontSize: 12, color: lightColors.muted, marginTop: 2 },
  sheetRate: {
    marginVertical: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: lightColors.line,
  },
  sheetKicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, color: lightColors.muted },
  sheetRateValue: { fontFamily: fonts.semibold, fontSize: 30, letterSpacing: -1.2, color: lightColors.ink, marginTop: 4 },
  sheetRateUnit: { fontSize: 14, color: lightColors.muted },
  sheetPrimary: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: lightColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPrimaryText: { fontFamily: fonts.semibold, fontSize: 15, color: '#FFFFFF' },
  sheetSecondary: {
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: '#EEECE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sheetSecondaryText: { fontFamily: fonts.semibold, fontSize: 15, color: lightColors.ink },
  pressed: { opacity: 0.75 },
})
