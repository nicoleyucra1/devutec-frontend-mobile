import { ActivityIndicator, Text, View } from 'react-native'
import PrimaryButton from './PrimaryButton'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Pantalla de carga, de error (con Reintentar) o de lista vacía
export default function ScreenState({ loading, error, onRetry, emptyTitle, emptyMessage }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        {onRetry && <PrimaryButton title="Reintentar" variant="secondary" onPress={onRetry} />}
      </View>
    )
  }
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{emptyTitle}</Text>
      {emptyMessage && <Text style={styles.message}>{emptyMessage}</Text>}
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: colors.error, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontFamily: fonts.semibold, color: colors.text, textAlign: 'center' },
  message: { color: colors.muted, textAlign: 'center', marginTop: 6 },
})