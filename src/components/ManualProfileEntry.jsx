import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { parseProfileLink } from '../utils/profileLink'
import { darkColors as colors, fonts, radius } from '../theme'

// Alternativa a la cámara: pegar el enlace del perfil o escribir su número.
// Va dentro del escáner, que siempre es oscuro.
export default function ManualProfileEntry({ onSubmit, autoFocus = false }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)

  const submit = () => {
    const userId = parseProfileLink(value)
    if (!userId) {
      setError('Eso no es un enlace de perfil de DevUTEC. Revisa que esté completo.')
      return
    }
    setError(null)
    onSubmit(userId)
  }

  return (
    <View>
      <Text style={styles.label}>O escribe el enlace del perfil</Text>
      <View style={[styles.field, error && styles.fieldError]}>
        <TextInput
          value={value}
          onChangeText={(text) => {
            setValue(text)
            setError(null)
          }}
          onSubmitEditing={submit}
          placeholder="devutec://freelancers/49"
          placeholderTextColor="#8F8D86"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="go"
          accessibilityLabel="Enlace o número del perfil"
          style={styles.input}
        />
        <Pressable onPress={submit} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Abrir</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.regular, fontSize: 13, color: '#AAA8A0', marginBottom: 10 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  fieldError: { borderColor: colors.error },
  input: { flex: 1, minWidth: 0, color: '#FFFFFF', fontFamily: fonts.regular, fontSize: 16 },
  button: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, marginTop: 8 },
  pressed: { opacity: 0.8 },
})
