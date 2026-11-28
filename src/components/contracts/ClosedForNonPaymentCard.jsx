import { Text, View } from 'react-native'
import PropTypes from 'prop-types'
import { useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, formatDate } from '../../utils/format'
import { closedForNonPayment, emergencyFundForStudent, refundedToClient, studentReceived } from '../../utils/installments'

// Contrato cerrado porque el cliente no hizo el pago 2 a tiempo (igual que en la web): qué recibió cada uno.
// Lo aprobado y la bolsa de emergencia son del estudiante; lo que no se usó volvió al cliente.
export default function ClosedForNonPaymentCard({ contract, isClient }) {
  const styles = useThemedStyles(createStyles)
  if (!closedForNonPayment(contract)) return null

  const freelancer = contract.freelancerName?.split(' ')[0] ?? 'el estudiante'
  const client = contract.clientName?.split(' ')[0] ?? 'El cliente'
  const approved = (contract.stages ?? []).filter((stage) => stage.status === 'APPROVED').map((stage) => stage.name)
  const when = contract.closedAt ? ` el ${formatDate(contract.closedAt)}` : ''
  const rows = isClient
    ? [
        ['Etapas aprobadas', approved.join(', ') || 'Ninguna'],
        [`${freelancer} recibe`, formatBudget(studentReceived(contract))],
        ['Se te devolvió', formatBudget(refundedToClient(contract))],
      ]
    : [
        ['Etapas aprobadas', approved.join(', ') || 'Ninguna'],
        ['Recibes en total', formatBudget(studentReceived(contract))],
        ['Incluye la bolsa de emergencia', formatBudget(emergencyFundForStudent(contract))],
      ]

  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.kicker}>CONTRATO CERRADO</Text>
      <Text style={styles.title}>
        {isClient ? 'Se cerró porque no se hizo el pago 2.' : `${client} no hizo el pago 2: tu trabajo queda pagado.`}
      </Text>
      <Text style={styles.text}>
        {isClient
          ? `El plazo venció${when}. ${freelancer} se queda con las etapas que aprobaste y con la bolsa de emergencia por el trabajo hecho. Lo que no se usó se te devolvió y las etapas que faltaban se cancelaron.`
          : `El plazo venció${when}. Te quedas con lo que ya aprobó y, además, recibes la bolsa de emergencia. No tienes que hacer el Desarrollo.`}
      </Text>
      <View style={styles.rows}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.pendingLight, borderWidth: 1, borderColor: colors.pending + '55', borderRadius: 20, padding: 18, gap: 6 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.pending },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.pending },
  rows: { backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  value: { flexShrink: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
})

ClosedForNonPaymentCard.propTypes = {
  contract: PropTypes.shape({
    closedReason: PropTypes.string,
    closedAt: PropTypes.string,
    freelancerName: PropTypes.string,
    clientName: PropTypes.string,
    stages: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, status: PropTypes.string })),
    installments: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  isClient: PropTypes.bool,
}
