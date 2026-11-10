import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useGithubRepos } from '../hooks/useGithubRepos'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Color del puntito de cada lenguaje; los que no están usan el gris del texto secundario
const LANGUAGE_COLORS = {
  JavaScript: '#E0B000',
  TypeScript: '#2E5BDA',
  Java: '#B42318',
  Python: '#B7791F',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  'C++': '#F34B7D',
}

// GitHub responde 404 si el usuario no existe y 403 o 429 cuando se pasa el límite de consultas
function githubError(status, username, fallback) {
  if (status === 404) return `No encontramos el usuario @${username} en GitHub. Revisa que esté bien escrito.`
  if (status === 403 || status === 429) return 'GitHub limitó las consultas por un rato. Inténtalo en unos minutos.'
  return fallback
}

async function openUrl(url) {
  try {
    await Linking.openURL(url)
  } catch {
    Alert.alert('No se pudo abrir el enlace', url)
  }
}

// Repos públicos del freelancer, sacados de la API de GitHub con su githubUsername.
// isOwner indica que el freelancer está viendo su propio perfil: cambia el mensaje cuando no tiene GitHub.
export default function GithubRepos({ username, isOwner = false }) {
  const { data: repos, error, status, loading, reload } = useGithubRepos(username)
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Repositorios</Text>
        {username && (
          <Pressable onPress={() => openUrl(`https://github.com/${username}`)} accessibilityRole="link" hitSlop={8}>
            <Text style={styles.profileLink}>github.com/{username}</Text>
          </Pressable>
        )}
      </View>

      {!username && (
        <View style={styles.card}>
          <Text style={styles.message}>
            {isOwner
              ? 'Todavía no agregaste tu usuario de GitHub. Agrégalo desde tu perfil en la web para mostrar tus repos.'
              : 'Este freelancer todavía no agregó su usuario de GitHub.'}
          </Text>
        </View>
      )}

      {username && loading && (
        <View style={styles.card}>
          <ActivityIndicator style={styles.loading} color={colors.text} />
        </View>
      )}

      {username && error && (
        <View style={styles.card}>
          <Text style={styles.error}>{githubError(status, username, error)}</Text>
          <Pressable onPress={reload} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {username && repos?.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.message}>@{username} todavía no tiene repos públicos.</Text>
        </View>
      )}

      {repos?.length > 0 && (
        <View style={[styles.card, styles.list]}>
          {repos.map((repo, index) => (
            <Pressable
              key={repo.id}
              onPress={() => openUrl(repo.url)}
              accessibilityRole="link"
              style={({ pressed }) => [styles.repo, index > 0 && styles.divider, pressed && styles.pressed]}
            >
              <View style={styles.repoIcon}>
                <Ionicons name="code-slash-outline" size={17} color={colors.text} />
              </View>
              <View style={styles.repoInfo}>
                <Text style={styles.repoName} numberOfLines={1}>
                  {repo.name}
                  {repo.fork && <Text style={styles.meta}> · fork</Text>}
                </Text>
                {repo.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {repo.description}
                  </Text>
                )}
                <View style={styles.metaRow}>
                  {repo.language && (
                    <>
                      <View style={[styles.dot, { backgroundColor: LANGUAGE_COLORS[repo.language] ?? colors.muted }]} />
                      <Text style={styles.meta}>{repo.language} · </Text>
                    </>
                  )}
                  <Text style={styles.meta}>★ {repo.stars}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  wrapper: { marginTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 },
  title: { fontFamily: fonts.semibold, fontSize: 19, letterSpacing: -0.4, color: colors.text },
  profileLink: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accent },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
  },
  list: { padding: 0, overflow: 'hidden' },
  message: { fontFamily: fonts.regular, color: colors.muted, lineHeight: 20 },
  loading: { marginVertical: 8 },
  error: { fontFamily: fonts.medium, color: colors.error, lineHeight: 20 },
  retry: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: { fontFamily: fonts.semibold, color: colors.text },
  repo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  repoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repoInfo: { flex: 1, minWidth: 0 },
  repoName: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  description: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  pressed: { opacity: 0.7 },
})
