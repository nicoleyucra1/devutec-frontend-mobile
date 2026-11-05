import { ActivityIndicator, Pressable, Text } from 'react-native'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Botón del diseño. variant "primary": tinta (lima en modo oscuro); "secondary": con borde.
// Mientras carga se deshabilita para evitar doble envío.
export default function PrimaryButton({ title, onPress, loading = false, variant = 'primary', style }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const isPrimary = variant === 'primary'

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.button, isPrimary ? styles.primary : styles.secondary, (pressed || loading) && styles.pressed, style]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.text} />
      ) : (
        <Text style={[styles.text, { color: isPrimary ? colors.onPrimary : colors.text }]}>{title}</Text>
      )}
    </Pressable>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  button: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.inputBorder },
  pressed: { opacity: 0.7 },
  text: { fontFamily: fonts.bold, fontSize: 16 },
})
