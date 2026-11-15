import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import EditableAvatar from '../../src/components/EditableAvatar'
import FreelancerHero from '../../src/components/FreelancerHero'
import GithubRepos from '../../src/components/GithubRepos'
import ProfileQr from '../../src/components/ProfileQr'
import { useAuth } from '../../src/hooks/useAuth'
import { userService } from '../../src/services/userService'
import { useMyFreelancerProfile } from '../../src/hooks/useMyFreelancerProfile'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { ROLE_LABELS } from '../../src/utils/roles'

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
]

// Datos del perfil de freelancer que se muestran en el celular: su tarjeta con la tarifa, su QR y sus repos de GitHub
// refreshKey cambia al deslizar hacia abajo para actualizar: ahí se vuelve a pedir el perfil
function FreelancerSection({ userId, refreshKey }) {
  const { data: profile, error, loading, reload } = useMyFreelancerProfile()
  useEffect(() => {
    if (refreshKey > 0) reload()
  }, [refreshKey, reload])
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  if (loading) return <ActivityIndicator style={styles.loading} color={colors.text} />

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
      <FreelancerHero profile={profile} editable />
      <ProfileQr userId={userId} />
      <GithubRepos username={profile.githubUsername} isOwner />
    </>
  )
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth()
  const { colors, preference, setPreference } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Al deslizar hacia abajo se piden de nuevo los datos del usuario (su foto) y, si es freelancer, su perfil
  const refresh = async () => {
    setRefreshing(true)
    setRefreshKey((key) => key + 1)
    try {
      await updateUser(await userService.getMe())
    } catch {
      // Sin conexión se sigue mostrando lo que ya estaba
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.text} />}
    >
      {/* El freelancer ve su tarjeta con la tarifa (FreelancerHero); los demás roles, su nombre y correo */}
      {user.rol !== 'FREELANCER' && (
        <View style={styles.card}>
          <EditableAvatar size={48} badgeBorder={colors.card} />
          <View style={styles.flex}>
            <Text style={styles.name}>{user.nombre ?? 'Sin nombre'}</Text>
            <Text style={styles.muted}>{user.email}</Text>
          </View>
          <Text style={styles.badge}>{ROLE_LABELS[user.rol] ?? user.rol}</Text>
        </View>
      )}

      {user.rol === 'FREELANCER' && <FreelancerSection userId={user.id} refreshKey={refreshKey} />}

      <Text style={styles.section}>APARIENCIA</Text>
      {/* Sistema sigue el modo del celular; Claro y Oscuro lo fijan y se recuerda al volver a abrir la app */}
      <View style={styles.segmented} accessibilityRole="radiogroup">
        {THEME_OPTIONS.map((option) => {
          const selected = preference === option.value
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <Ionicons name={option.icon} size={16} color={selected ? colors.onPrimary : colors.text} />
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
            </Pressable>
          )
        })}
      </View>

      {/* Al cerrar sesión, el layout raíz vuelve solo a la bienvenida */}
      <Pressable onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
  },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  muted: { fontFamily: fonts.regular, color: colors.muted, marginTop: 2 },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 12,
    backgroundColor: colors.accentLight,
    color: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  section: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted, marginTop: 28, marginBottom: 10 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: radius.sm },
  segmentSelected: { backgroundColor: colors.primary },
  segmentText: { fontFamily: fonts.semibold, color: colors.text, fontSize: 14 },
  segmentTextSelected: { color: colors.onPrimary },
  logout: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  logoutText: { fontFamily: fonts.bold, color: colors.error, fontSize: 16 },
  loading: { marginTop: 24 },
  errorBox: { marginTop: 16, backgroundColor: colors.errorLight, borderRadius: radius.md, padding: 16 },
  errorText: { fontFamily: fonts.medium, color: colors.error },
  retryText: { fontFamily: fonts.bold, color: colors.text, marginTop: 8, textDecorationLine: 'underline' },
})
