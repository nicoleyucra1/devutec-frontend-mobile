import { Pressable, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import StatusBadge from '../StatusBadge'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatBudget } from '../../utils/format'
import { idType } from '../../utils/propShapes'
import { CONTRACT_STATUS, PAYMENT_STATUS } from '../../utils/status'

// Color del texto del pago, según su tono (retenido = ámbar, liberado = verde)
function paymentColor(colors, tone) {
  if (tone === 'pending') return colors.pending
  if (tone === 'success') return colors.accent
  return colors.muted
}

// Tarjeta de un contrato: monto grande, estado a la derecha, título y una línea de detalle (meta).
// showPayment agrega debajo del estado si el pago está retenido o liberado.
// highlight pone el borde verde: lo que la persona tiene que revisar ahora.
export default function ContractCard({ contract, meta, onPress, showPayment = false, highlight = false }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const payment = PAYMENT_STATUS[contract.paymentStatus]

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, highlight && styles.highlight, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Text style={styles.amount}>{formatBudget(contract.amount)}</Text>
        <View style={styles.status}>
          <StatusBadge status={CONTRACT_STATUS[contract.status]} fallback={contract.status} />
          {showPayment && payment ? (
            <Text style={[styles.payment, { color: paymentColor(colors, payment.tone) }]}>{payment.label}</Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {contract.projectTitle}
      </Text>
      {meta ? (
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </Pressable>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  highlight: { borderWidth: 1.5, borderColor: colors.accent },
  pressed: { opacity: 0.75 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  amount: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -1, color: colors.text },
  status: { alignItems: 'flex-end', gap: 6 },
  payment: { fontFamily: fonts.semibold, fontSize: 12 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 12 },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
})

ContractCard.propTypes = {
  contract: PropTypes.shape({
    id: idType.isRequired,
    projectTitle: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    paymentStatus: PropTypes.string,
  }).isRequired,
  meta: PropTypes.string,
  onPress: PropTypes.func,
  showPayment: PropTypes.bool,
  highlight: PropTypes.bool,
}
