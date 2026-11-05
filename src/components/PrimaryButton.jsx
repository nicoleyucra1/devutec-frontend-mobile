import { ActivityIndicator, Pressable, Text } from 'react-native'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Botón del diseño (alto 54, radio 16). variant "primary": tinta (lima en modo oscuro); "secondary": con borde;
// "danger": rojo, para acciones destructivas como cancelar un contrato.
// Mientras carga o si está deshabilitado no se puede tocar, para evitar doble envío.
export default function PrimaryButton({ title, onPress, loading = false, disabled = false, variant = 'primary', icon, style }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const isPrimary = variant === 'primary'
  const isDanger = variant === 'danger'
  const textColor = isPrimary ? colors.onPrimary : isDanger ? '#FFFFFF' : colors.text

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant] ?? styles.primary,
        pressed && styles.pressed,
        (loading || disabled) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  button: {
    height: 54,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder },
  danger: { backgroundColor: colors.error },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.38 },
  text: { fontFamily: fonts.semibold, fontSize: 15 },
})
