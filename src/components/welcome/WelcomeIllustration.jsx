import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Floating from './Floating'
import Cuyi from '../brand/Cuyi'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'

// Dibujo de la bienvenida: Cuyi en una tarjeta lima y, alrededor, burbujas que cuentan
// cómo funciona el pago protegido. Las burbujas flotan cada una a su ritmo.
export default function WelcomeIllustration() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Cuyi size={150} />
      </View>

      <Floating duration={2600} style={{ top: 28, left: 0 }}>
        <View style={styles.pill}>
          <View style={styles.dot} />
          <Text style={styles.pillText}>PROTEGIDO</Text>
        </View>
      </Floating>

      <Floating duration={3000} style={{ top: 70, right: 0 }}>
        <View style={styles.money}>
          <Text style={styles.moneyLabel}>EN GARANTÍA</Text>
          <Text style={styles.moneyValue}>S/ 600.00</Text>
        </View>
      </Floating>

      <Floating duration={2800} style={{ bottom: 4, left: 14 }}>
        <View style={styles.pill}>
          <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={styles.pillText}>Pago liberado</Text>
        </View>
      </Floating>

      <Floating duration={2200} style={{ bottom: 28, right: 22 }}>
        <View style={styles.code}>
          <Ionicons name="code-slash" size={18} color={colors.lime} />
        </View>
      </Floating>
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  container: { height: 280, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 220,
    height: 220,
    borderRadius: 28,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.escrow },
  pillText: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.4, color: colors.text },
  money: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  moneyLabel: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, color: colors.muted },
  moneyValue: { fontFamily: fonts.extrabold, fontSize: 20, letterSpacing: -0.5, color: colors.text },
  code: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    // El borde lo separa del fondo en modo oscuro, donde el fondo también es tinta
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
