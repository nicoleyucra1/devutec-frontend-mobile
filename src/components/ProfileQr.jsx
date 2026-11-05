import { Pressable, Share, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import { useTheme, useThemedStyles } from '../hooks/useTheme'
import { buildProfileLink } from '../utils/profileLink'

// QR con el enlace al perfil público del freelancer, para que un cliente lo escanee.
// El QR siempre es negro sobre blanco, también en modo oscuro: así lo leen todas las cámaras.
export default function ProfileQr({ userId }) {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const link = buildProfileLink(userId)

  const share = () => {
    // Si el usuario cierra la hoja de compartir no pasa nada, así que el error se ignora
    Share.share({ message: `Mira mi perfil en DevUTEC: ${link}` }).catch(() => {})
  }

  return (
    <View style={styles.card} accessibilityLabel="Compartir perfil">
      <Text style={styles.kicker}>MI CÓDIGO</Text>
      <View style={styles.qr} accessible accessibilityRole="image" accessibilityLabel="Código QR de tu perfil">
        {/* La "U" tapa el centro del código; con corrección de errores alta (ecl H) igual se lee */}
        <QRCode value={link} size={176} color="#0E0E0C" backgroundColor="#FFFFFF" ecl="H" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>U</Text>
        </View>
      </View>
      <Text style={styles.link} selectable>
        {link}
      </Text>
      <Text style={styles.help}>Los clientes lo escanean para ver tu perfil y tus reseñas.</Text>

      <View style={styles.actions}>
        <Pressable onPress={share} style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}>
          <Ionicons name="share-outline" size={17} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Compartir</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/scan')}
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
        >
          <Ionicons name="scan-outline" size={17} color={colors.text} />
          <Text style={styles.buttonText}>Escanear</Text>
        </Pressable>
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  kicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.3, color: colors.muted },
  qr: {
    marginTop: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: 17,
    backgroundColor: colors.lime,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  help: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 16, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
  button: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 1, borderColor: colors.inputBorder },
  buttonText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  pressed: { opacity: 0.75 },
})
