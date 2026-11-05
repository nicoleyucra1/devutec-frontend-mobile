import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { parseProfileLink } from '../utils/profileLink'
import { colors } from '../theme'

// Alternativa a la cámara: pegar el enlace del perfil o escribir su número
export default function ManualProfileEntry({ onSubmit }) {
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
    <View style={styles.card}>
      <Text style={styles.title}>¿No puedes usar la cámara?</Text>
      <Text style={styles.muted}>Pega el enlace que te compartió el freelancer o escribe el número de su perfil.</Text>
      <TextInput
        value={value}
        onChangeText={(text) => {
          setValue(text)
          setError(null)
        }}
        onSubmitEditing={submit}
        placeholder="devutec://freelancers/49"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={submit} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Ver perfil</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, marginTop: 6 },
  button: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: colors.primary, fontWeight: '600' },
  pressed: { opacity: 0.7 },
})
