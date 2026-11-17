import { Text, View } from 'react-native'
import PropTypes from 'prop-types'
import { useThemedStyles } from '../../hooks/useTheme'

// Tarjeta chica con un número: etiqueta arriba, número grande y una nota abajo.
// highlight subraya el número en lima (lo que pide atención, como postulaciones nuevas).
export default function StatCard({ label, value, note, highlight = false, suffix }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {value}
          </Text>
          {highlight ? <View style={styles.underline} /> : null}
        </View>
        {suffix}
      </View>
      {note ? (
        <Text style={styles.note} numberOfLines={1}>
          {note}
        </Text>
      ) : null}
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  label: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  value: { fontFamily: fonts.bold, fontSize: 30, letterSpacing: -1.2, color: colors.text },
  // El subrayado lima va detrás de la parte baja del número, como un resaltador
  underline: { position: 'absolute', left: 0, right: 0, bottom: 3, height: 6, backgroundColor: colors.lime, zIndex: -1 },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 },
})

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  note: PropTypes.string,
  highlight: PropTypes.bool,
  suffix: PropTypes.node,
}
