import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { colors } from '../theme'

// Botón principal; mientras carga se deshabilita para evitar doble envío.
// variant: 'primary' (por defecto), 'secondary' (blanco con borde) o 'danger' (rojo)
export default function PrimaryButton({ title, onPress, loading = false, variant = 'primary' }) {
  const isPrimary = variant === 'primary'
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.button, styles[variant], (pressed || loading) && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || variant === 'danger' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primary: {},
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.error },
  pressed: { opacity: 0.7 },
  text: { color: colors.white, fontSize: 16, fontWeight: '600' },
  secondaryText: { color: colors.text },
})