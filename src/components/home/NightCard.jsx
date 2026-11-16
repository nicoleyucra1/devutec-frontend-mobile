import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import Money from '../Money'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'

// Tarjeta oscura del Inicio: el monto principal arriba y dos datos abajo, separados por una línea.
// label: etiqueta lima de arriba (con candado si lock); corner: lo que va a la derecha de la etiqueta.
// stats: [{ label, value, lock }] para la fila de abajo.
export default function NightCard({ label, lock = false, corner, amount, caption, stats }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.labelRow}>
          {lock ? <Ionicons name="lock-closed-outline" size={13} color={colors.lime} /> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
        {corner}
      </View>
      <Money value={amount} style={styles.amount} centsStyle={styles.cents} />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      <View style={styles.line} />
      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <View style={styles.labelRow}>
              {stat.lock ? <Ionicons name="lock-closed-outline" size={11} color={colors.nightMuted} /> : null}
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.night, borderRadius: 24, padding: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.lime },
  amount: { fontFamily: fonts.bold, fontSize: 46, letterSpacing: -2.4, color: colors.onNight, marginTop: 14 },
  cents: { color: colors.nightMuted },
  caption: { fontFamily: fonts.regular, fontSize: 13, color: colors.nightMuted, marginTop: 4 },
  line: { height: 1, backgroundColor: colors.nightLine, marginVertical: 18 },
  stats: { flexDirection: 'row', gap: 16 },
  stat: { flex: 1 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.nightMuted },
  statValue: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.8, color: colors.onNight, marginTop: 10 },
})

NightCard.propTypes = {
  label: PropTypes.string.isRequired,
  lock: PropTypes.bool,
  corner: PropTypes.node,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  caption: PropTypes.string,
  stats: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.node, lock: PropTypes.bool }),
  ).isRequired,
}
