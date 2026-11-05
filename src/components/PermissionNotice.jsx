import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

// Aviso para cuando la app no tiene un permiso (cámara, ubicación...).
// Si todavía se puede preguntar, muestra el botón para pedirlo; si el usuario lo negó
// para siempre, el sistema ya no vuelve a preguntar y solo queda activarlo desde los ajustes.
export default function PermissionNotice({ icon = 'lock-closed-outline', title, message, canAskAgain, onRequest }) {
  const openSettings = () => Linking.openSettings().catch(() => {})

  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={32} color={colors.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {canAskAgain ? (
        <Pressable onPress={onRequest} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Permitir acceso</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.message}>Negaste el permiso antes. Puedes activarlo en los ajustes del celular.</Text>
          <Pressable onPress={openSettings} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            <Text style={styles.buttonText}>Abrir ajustes</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 8, textAlign: 'center' },
  message: { color: colors.muted, marginTop: 6, textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  buttonText: { color: colors.white, fontWeight: '600' },
  pressed: { opacity: 0.7 },
})
