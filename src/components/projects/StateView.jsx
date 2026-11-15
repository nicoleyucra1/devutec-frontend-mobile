import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import PropTypes from 'prop-types'

// Pantallas de carga, error y lista vacía, con un botón opcional
export default function StateView({ loading, title, message, actionLabel, onAction }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
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

const createStyles = ({ colors, fonts }) => ({
  container: { alignItems: 'center', backgroundColor: colors.background, flex: 1, gap: 8, justifyContent: 'center', padding: 32 },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, textAlign: 'center' },
  message: { color: colors.muted, fontFamily: fonts.regular, textAlign: 'center' },
  button: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginTop: 8, paddingHorizontal: 16, paddingVertical: 8 },
  buttonText: { color: colors.text, fontFamily: fonts.medium },
})

StateView.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}
