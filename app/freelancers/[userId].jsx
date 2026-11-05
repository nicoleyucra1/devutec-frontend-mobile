import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import GithubRepos from '../../src/components/GithubRepos'
import { useFreelancerProfile } from '../../src/hooks/useFreelancerProfile'
import { colors } from '../../src/theme'

function formatRate(value) {
  return value === null || value === undefined ? null : `S/ ${Number(value).toFixed(2)} por hora`
}

function studyLabel(profile) {
  if (profile.egresado) return 'Egresado'
  if (profile.ciclo) return `Ciclo ${profile.ciclo}`
  return null
}

async function openUrl(url) {
  try {
    await Linking.openURL(url)
  } catch {
    Alert.alert('No se pudo abrir el enlace', url)
  }
}

// Perfil público de un freelancer; se llega aquí al escanear su QR
export default function FreelancerProfileScreen() {
  const { userId } = useLocalSearchParams()
  const { data: profile, error, status, loading, reload } = useFreelancerProfile(userId)

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Perfil del freelancer', headerBackTitle: 'Volver' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        {loading && <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {status === 404 || status === 400 ? 'Este freelancer no existe o ya no tiene perfil.' : error}
            </Text>
            {status !== 404 && status !== 400 && (
              <Pressable onPress={reload} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.link}>Reintentar</Text>
              </Pressable>
            )}
          </View>
        )}

        {profile && (
          <>
            <View style={styles.card}>
              <Text style={styles.name}>{profile.nombre}</Text>
              {profile.universidad && <Text style={styles.muted}>{profile.universidad}</Text>}

              <View style={styles.facts}>
                {[studyLabel(profile), formatRate(profile.tarifaHora)].filter(Boolean).map((fact) => (
                  <Text key={fact} style={styles.badge}>
                    {fact}
                  </Text>
                ))}
              </View>

              <Text style={styles.rating}>
                {profile.calificacionPromedio
                  ? `★ ${Number(profile.calificacionPromedio).toFixed(1)} de calificación`
                  : 'Todavía no tiene reseñas'}
              </Text>

              {profile.portafolioUrl && (
                <Pressable onPress={() => openUrl(profile.portafolioUrl)} accessibilityRole="link">
                  <Text style={styles.link}>Ver portafolio →</Text>
                </Pressable>
              )}
            </View>

            <GithubRepos username={profile.githubUsername} />
          </>
        )}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24 },
  loading: { marginTop: 48 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badge: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  rating: { marginTop: 12, color: colors.text, fontWeight: '600' },
  link: { color: colors.primary, fontWeight: '600', marginTop: 12 },
  errorBox: { backgroundColor: colors.errorLight, borderRadius: 12, padding: 16 },
  errorText: { color: colors.error },
  pressed: { opacity: 0.6 },
})
