import { Pressable, Share, StyleSheet, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { buildProfileLink } from '../utils/profileLink'
import { colors } from '../theme'

// QR con el enlace al perfil público del freelancer, para que un cliente lo escanee
export default function ProfileQr({ userId }) {
  const link = buildProfileLink(userId)

  const share = () => {
    // Si el usuario cierra la hoja de compartir no pasa nada, así que el error se ignora
    Share.share({ message: `Mira mi perfil en DevUTEC: ${link}` }).catch(() => {})
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Mi código QR</Text>
      <Text style={styles.muted}>Muéstralo a un cliente para que vea tu perfil escaneándolo desde la app.</Text>
      <View style={styles.qr} accessible accessibilityLabel="Código QR de tu perfil">
        <QRCode value={link} size={180} color={colors.text} backgroundColor={colors.white} />
      </View>
      <Pressable onPress={share} style={({ pressed }) => [styles.share, pressed && styles.pressed]}>
        <Text style={styles.shareText}>Compartir enlace</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, alignSelf: 'flex-start' },
  muted: { color: colors.muted, marginTop: 4, alignSelf: 'flex-start' },
  qr: { marginVertical: 16, padding: 12, backgroundColor: colors.white },
  share: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shareText: { color: colors.text, fontWeight: '600' },
  pressed: { opacity: 0.6 },
})
