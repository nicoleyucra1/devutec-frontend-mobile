import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Campo de formulario (alto 52, radio 14) con su etiqueta y el error debajo.
// Con secureTextEntry muestra un ojito para ver u ocultar la contraseña. Con multiline crece hacia abajo;
// style se aplica al texto (por ejemplo { minHeight: 120 } para un mensaje largo).
export default function FormField({ label, error, secureTextEntry, multiline, style, children, ...inputProps }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, multiline && styles.boxMultiline, error && styles.boxError]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          multiline={multiline}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry && !visible}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  field: { marginBottom: 16 },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginBottom: 8 },
  box: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  boxMultiline: { height: 'auto', minHeight: 52, alignItems: 'flex-start', paddingVertical: 12 },
  boxError: { borderColor: colors.error },
  // outlineStyle quita el borde de foco que agrega el navegador en la versión web
  input: { flex: 1, height: '100%', fontFamily: fonts.regular, fontSize: 16, color: colors.text, outlineStyle: 'none' },
  inputMultiline: { height: undefined, textAlignVertical: 'top' },
  error: { fontFamily: fonts.medium, color: colors.error, fontSize: 13, marginTop: 6 },
})
