import { Pressable, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import { useThemedStyles } from '../../hooks/useTheme'

// Aviso oscuro arriba de la lista cuando no hay conexión pero sí datos guardados (mockup M9).
// Los datos de abajo se ven apagados y las acciones con dinero esperan a que vuelva la conexión.
export default function OfflineBanner({ savedAgo, onRetry, retrying = false }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={styles.cuyi}>
        <Cuyi anim="duerme" size={40} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Sin conexión</Text>
        <Text style={styles.body}>Datos guardados {savedAgo}. Las acciones con dinero se activan al reconectar.</Text>
      </View>
      <Pressable
        onPress={onRetry}
        disabled={retrying}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, (pressed || retrying) && styles.pressed]}
      >
        <Text style={styles.buttonText}>{retrying ? 'Conectando…' : 'Reintentar'}</Text>
      </Pressable>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.night,
    borderRadius: 20,
    padding: 14,
  },
  cuyi: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.onNight },
  body: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.nightMuted, marginTop: 2 },
  button: { backgroundColor: colors.lime, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.limeText },
  pressed: { opacity: 0.7 },
})

OfflineBanner.propTypes = {
  savedAgo: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  retrying: PropTypes.bool,
}
