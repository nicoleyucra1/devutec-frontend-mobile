import { Text, TextInput, View } from 'react-native'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Campo de formulario con su etiqueta y el mensaje de error debajo
export default function FormField({ label, error, ...inputProps }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, error && styles.inputError]} placeholderTextColor={colors.muted} {...inputProps} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  field: { marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.error },
  error: { fontFamily: fonts.medium, color: colors.error, fontSize: 13, marginTop: 4 },
})
