import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import GithubRepos from '../../src/components/GithubRepos'
import ProfileQr from '../../src/components/ProfileQr'
import { useAuth } from '../../src/hooks/useAuth'
import { useMyFreelancerProfile } from '../../src/hooks/useMyFreelancerProfile'
import { ROLE_LABELS } from '../../src/utils/roles'
import { colors } from '../../src/theme'

// Datos del perfil de freelancer que se muestran en el celular: su QR y sus repos de GitHub
function FreelancerSection({ userId }) {
  const { data: profile, error, loading, reload } = useMyFreelancerProfile()

  if (loading) return <ActivityIndicator style={styles.loading} color={colors.primary} />

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={reload} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <ProfileQr userId={userId} />
      <GithubRepos username={profile.githubUsername} />
    </>
  )
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user.nombre ?? 'Sin nombre'}</Text>
        <Text style={styles.muted}>{user.email}</Text>
        <Text style={styles.badge}>{ROLE_LABELS[user.rol] ?? user.rol}</Text>
      </View>

      {user.rol === 'FREELANCER' && <FreelancerSection userId={user.id} />}

      {/* Al cerrar sesión, el layout raíz vuelve solo al login */}
      <Pressable onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24 },
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
  loading: { marginTop: 24 },
  errorBox: {
    marginTop: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: 16,
  },
  errorText: { color: colors.error },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
  logoutText: { color: colors.error, fontWeight: '600', fontSize: 16 },
})
