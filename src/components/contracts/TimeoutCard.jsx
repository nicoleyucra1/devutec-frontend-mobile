import { Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import Money from '../Money'
import PrimaryButton from '../PrimaryButton'
import { useThemedStyles } from '../../hooks/useTheme'

// El servidor no respondió a tiempo (mockup M9, "Tiempo agotado"). Recuerda que el dinero en garantía
// no se movió: así nadie piensa que un pago quedó a medias.
export default function TimeoutCard({ seconds, heldAmount, onRetry }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.card} accessibilityRole="alert">
      <View style={styles.cuyi}>
        <Cuyi anim="confundido" size={64} />
      </View>
      <Text style={styles.eyebrow}>TIEMPO AGOTADO</Text>
      <Text style={styles.title}>
        La conexión tardó <Text style={styles.serif}>demasiado.</Text>
      </Text>
      <Text style={styles.body}>
        Esperamos {seconds} segundos sin respuesta.{' '}
        {heldAmount > 0 ? (
          <>
            Tus <Money value={heldAmount} /> en garantía siguen protegidos; ningún pago se movió.
          </>
        ) : (
          'Tu dinero en garantía sigue protegido; ningún pago se movió.'
        )}
      </Text>
      <PrimaryButton title="Reintentar" onPress={onRetry} style={styles.button} />
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 22 },
  cuyi: { width: 88, height: 88, borderRadius: 20, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.error, marginTop: 24 },
  title: { fontFamily: fonts.medium, fontSize: 24, lineHeight: 32, letterSpacing: -0.8, color: colors.text, marginTop: 8 },
  serif: { fontFamily: fonts.serifItalic, fontSize: 28 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 10 },
  button: { marginTop: 22 },
})

TimeoutCard.propTypes = {
  seconds: PropTypes.number.isRequired,
  heldAmount: PropTypes.number,
  onRetry: PropTypes.func.isRequired,
}
