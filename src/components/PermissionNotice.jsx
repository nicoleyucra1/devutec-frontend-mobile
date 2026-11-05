import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { darkColors as colors, fonts, radius } from '../theme'

// Aviso para cuando la app no tiene un permiso (cámara, ubicación...), sobre fondo oscuro como el escáner.
// Si todavía se puede preguntar, muestra el botón para pedirlo; si el usuario lo negó
// para siempre, el sistema ya no vuelve a preguntar y solo queda activarlo desde los ajustes.
export default function PermissionNotice({ icon = 'lock-closed-outline', kicker, title, highlight, message, canAskAgain, onRequest }) {
  const openSettings = () => Linking.openSettings().catch(() => {})

  return (
    <View>
      <View style={styles.icon}>
        <Ionicons name={icon} size={30} color={colors.lime} />
      </View>
      {kicker && <Text style={styles.kicker}>{kicker}</Text>}
      <Text style={styles.title}>
        {title} {highlight && <Text style={styles.highlight}>{highlight}</Text>}
      </Text>
      <Text style={styles.message}>
        {message}
        {!canAskAgain && ' Como negaste el permiso antes, actívalo en los ajustes del celular.'}
      </Text>
      <Pressable
        onPress={canAskAgain ? onRequest : openSettings}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{canAskAgain ? 'Permitir acceso' : 'Abrir ajustes'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.3, color: colors.lime, marginTop: 28 },
  title: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 34, letterSpacing: -1.2, color: '#FFFFFF', marginTop: 10 },
  highlight: { fontFamily: fonts.serifItalic, color: colors.lime, letterSpacing: 0 },
  message: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#AAA8A0', marginTop: 10 },
  button: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  buttonText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  pressed: { opacity: 0.8 },
})
