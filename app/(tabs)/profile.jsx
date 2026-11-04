import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/hooks/useAuth'
import { ROLE_LABELS } from '../../src/utils/roles'
import { colors } from '../../src/theme'

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user.nombre ?? 'Sin nombre'}</Text>
        <Text style={styles.muted}>{user.email}</Text>
        <Text style={styles.badge}>{ROLE_LABELS[user.rol] ?? user.rol}</Text>
      </View>

      {/* Al cerrar sesión, el layout raíz vuelve solo al login */}
      <Pressable onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  logout: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  logoutText: { color: colors.error, fontWeight: '600', fontSize: 16 },
})
