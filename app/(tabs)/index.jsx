import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/hooks/useAuth'
import { ROLE_LABELS } from '../../src/utils/roles'
import { colors } from '../../src/theme'

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {user.nombre ?? user.email}</Text>
      <Text style={styles.muted}>Cuenta de {ROLE_LABELS[user.rol]?.toLowerCase() ?? user.rol}</Text>

      <Pressable onPress={() => router.push('/scan')} style={({ pressed }) => [styles.scan, pressed && styles.pressed]}>
        <Ionicons name="qr-code-outline" size={22} color={colors.white} />
        <Text style={styles.scanText}>Escanear el QR de un freelancer</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
  scan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 24,
  },
  scanText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.7 },
})
