import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import FreelancerHero from '../../src/components/FreelancerHero'
import GithubRepos from '../../src/components/GithubRepos'
import { useFreelancerProfile } from '../../src/hooks/useFreelancerProfile'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'

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
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const notFound = status === 404 || status === 400

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Perfil',
          headerBackTitle: 'Volver',
          // Barra con fondo sólido para que en iOS no tape el contenido
          headerTransparent: false,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator style={styles.loading} size="large" color={colors.text} />}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{notFound ? 'Perfil no encontrado' : 'No se pudo cargar el perfil'}</Text>
            <Text style={styles.errorText}>{notFound ? 'Este freelancer no existe o ya no tiene perfil.' : error}</Text>
            {!notFound && (
              <Pressable onPress={reload} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            )}
          </View>
        )}

        {profile && (
          <>
            <FreelancerHero profile={profile} />

            {profile.portafolioUrl && (
              <Pressable
                onPress={() => openUrl(profile.portafolioUrl)}
                accessibilityRole="link"
                style={({ pressed }) => [styles.portfolio, pressed && styles.pressed]}
              >
                <Ionicons name="globe-outline" size={18} color={colors.text} />
                <Text style={styles.portfolioText}>Ver portafolio</Text>
                <Ionicons name="open-outline" size={16} color={colors.muted} />
              </Pressable>
            )}

            <GithubRepos username={profile.githubUsername} />
          </>
        )}
      </ScrollView>
    </>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  loading: { marginTop: 48 },
  portfolio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  portfolioText: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  errorBox: { backgroundColor: colors.errorLight, borderRadius: radius.lg, padding: 16 },
  errorTitle: { fontFamily: fonts.bold, color: colors.error, fontSize: 16 },
  errorText: { fontFamily: fonts.regular, color: colors.error, marginTop: 4 },
  retryText: { fontFamily: fonts.bold, color: colors.text, marginTop: 10, textDecorationLine: 'underline' },
  pressed: { opacity: 0.7 },
})
