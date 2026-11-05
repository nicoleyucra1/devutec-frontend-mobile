import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

// Campo de formulario con su etiqueta y el mensaje de error debajo.
// Si es de contraseña (secureTextEntry), muestra un ojito para verla u ocultarla.
export default function FormField({ label, error, secureTextEntry, style, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const isPassword = Boolean(secureTextEntry)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, isPassword && styles.inputWithIcon, error && styles.inputError, style]}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !visible}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setVisible((current) => !current)}
            style={styles.eye}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputWithIcon: { paddingRight: 44 },
  inputError: { borderColor: colors.error },
  eye: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  error: { color: colors.error, fontSize: 13, marginTop: 4 },
})