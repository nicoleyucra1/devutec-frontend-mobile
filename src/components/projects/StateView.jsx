import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'

// Pantallas de carga, error y lista vacía, con un botón opcional
export default function StateView({ loading, title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, gap: 8, justifyContent: 'center', padding: 32 },
  title: { color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  message: { color: colors.muted, textAlign: 'center' },
  button: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, marginTop: 8, paddingHorizontal: 16, paddingVertical: 8 },
  buttonText: { color: colors.text, fontWeight: '500' },
})
