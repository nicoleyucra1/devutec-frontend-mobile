import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useGithubRepos } from '../hooks/useGithubRepos'
import { colors } from '../theme'

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

// Repos públicos del freelancer, sacados de la API de GitHub con su githubUsername
export default function GithubRepos({ username }) {
  const { data: repos, error, status, loading, reload } = useGithubRepos(username)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="logo-github" size={20} color={colors.text} />
        <Text style={styles.title}>Repos de GitHub</Text>
      </View>

      {!username && (
        <Text style={styles.muted}>
          Todavía no agregaste tu usuario de GitHub. Agrégalo desde tu perfil en la web para mostrar tus repos.
        </Text>
      )}

      {username && loading && <ActivityIndicator style={styles.loading} color={colors.primary} />}

      {username && error && (
        <View>
          <Text style={styles.error}>{githubError(status, username, error)}</Text>
          <Pressable onPress={reload} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {username && repos?.length === 0 && (
        <Text style={styles.muted}>@{username} todavía no tiene repos públicos.</Text>
      )}

      {repos?.map((repo) => (
        <Pressable
          key={repo.id}
          onPress={() => openUrl(repo.url)}
          accessibilityRole="link"
          style={({ pressed }) => [styles.repo, pressed && styles.pressed]}
        >
          <Text style={styles.repoName}>
            {repo.name}
            {repo.fork && <Text style={styles.muted}> · fork</Text>}
          </Text>
          {repo.description && (
            <Text style={styles.description} numberOfLines={2}>
              {repo.description}
            </Text>
          )}
          <Text style={styles.meta}>
            {[repo.language, `★ ${repo.stars}`].filter(Boolean).join('  ·  ')}
          </Text>
        </Pressable>
      ))}

      {repos?.length > 0 && (
        <Pressable onPress={() => openUrl(`https://github.com/${username}`)} accessibilityRole="link">
          <Text style={styles.link}>Ver todo en GitHub →</Text>
        </Pressable>
      )}
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
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  loading: { marginVertical: 16 },
  error: { color: colors.error },
  retry: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: { color: colors.text, fontWeight: '600' },
  repo: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  repoName: { fontWeight: '600', color: colors.primary, fontSize: 15 },
  description: { color: colors.muted, marginTop: 2 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '600', marginTop: 12 },
  pressed: { opacity: 0.6 },
})
