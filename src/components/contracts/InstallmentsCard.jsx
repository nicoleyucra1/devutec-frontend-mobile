import { Text, View } from 'react-native'
import PropTypes from 'prop-types'
import PrimaryButton from '../PrimaryButton'
import StatusBadge from '../StatusBadge'
import { useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, formatDate } from '../../utils/format'

// Estado de cada pago, con los mismos tonos que el resto de la app
const STATUS = {
  PENDING: { label: 'Pendiente', tone: 'pending' },
  HELD: { label: 'En garantía', tone: 'progress' },
  RELEASED: { label: 'Liberado', tone: 'success' },
  REFUNDED: { label: 'Devuelto', tone: 'muted' },
}

// Pago en dos partes (igual que en la web): cada pago con su desglose (lo del estudiante + la comisión de DEVUTEC),
// su estado y, para el cliente, el botón de pagar el que toca. El estudiante ve cuándo puede seguir trabajando.
export default function InstallmentsCard({ contract, isClient, onPay, paying, awaitingPayment, onVerify }) {
  const styles = useThemedStyles(createStyles)
  const installments = contract.installments ?? []
  if (installments.length === 0) return null

  const freelancer = contract.freelancerName?.split(' ')[0] ?? 'el estudiante'
  const client = contract.clientName?.split(' ')[0] ?? 'El cliente'
  const open = contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED'
  const next = installments.find((installment) => installment.status === 'PENDING')

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>PAGO EN DOS PARTES</Text>
      <Text style={styles.title}>
        {formatBudget(contract.amount)} en {installments.length === 1 ? 'un pago' : `${installments.length} pagos`}
      </Text>
      {contract.studentAmount != null && (
        <Text style={styles.breakdown}>
          {formatBudget(contract.studentAmount)} son para {freelancer} y {formatBudget(contract.commissionAmount)} son la tarifa de
          DEVUTEC. {freelancer} no paga comisión.
        </Text>
      )}

      <View style={styles.list}>
        {installments.map((installment) => {
          const status = STATUS[installment.status] ?? STATUS.PENDING
          const isNext = open && next?.number === installment.number
          return (
            <View key={installment.number} style={styles.item}>
              <View style={styles.itemTop}>
                <Text style={styles.itemLabel}>{installment.label}</Text>
                <Text style={styles.itemAmount}>{formatBudget(installment.clientAmount)}</Text>
              </View>
              <StatusBadge status={status} />
              <Text style={styles.small}>
                {formatBudget(installment.studentAmount)} para {freelancer} + {formatBudget(installment.commissionAmount)} de comisión
                {Number(installment.reserveAmount) > 0
                  ? `. Incluye ${formatBudget(installment.reserveAmount)} de bolsa de emergencia, que se libera al final.`
                  : '.'}
              </Text>

              {Number(installment.releasedAmount) > 0 && installment.status === 'HELD' && (
                <Text style={styles.released}>
                  Ya se liberaron {formatBudget(installment.releasedAmount)} a {freelancer} por las etapas aprobadas.
                </Text>
              )}
              {installment.paidAt ? <Text style={styles.small}>Pagado el {formatDate(installment.paidAt)}</Text> : null}

              {isNext && isClient && installment.payableNow && (
                <View style={styles.payBox}>
                  <PrimaryButton
                    title={`Pagar ${formatBudget(installment.clientAmount)}`}
                    loading={paying && !awaitingPayment}
                    onPress={() => onPay(installment.number)}
                  />
                  {awaitingPayment && (
                    <PrimaryButton title="Ya pagué, verificar" variant="secondary" loading={paying} onPress={onVerify} />
                  )}
                  <Text style={styles.hint}>Tu dinero queda en garantía y se libera solo cuando apruebas cada etapa.</Text>
                  <Text style={styles.hint}>Modo de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC</Text>
                </View>
              )}
              {isNext && !installment.payableNow && (
                <Text style={styles.waiting}>
                  {isClient
                    ? 'Se habilita cuando apruebes el Diseño.'
                    : `${client} hará este pago cuando apruebe el Diseño. No empieces el Desarrollo hasta entonces.`}
                </Text>
              )}
              {isNext && installment.payableNow && !isClient && (
                <Text style={styles.waiting}>Esperando este pago de {client}. Podrás entregar cuando lo haga.</Text>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.muted },
  title: { fontFamily: fonts.semibold, fontSize: 19, color: colors.text, marginTop: 6 },
  breakdown: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 6 },
  list: { gap: 10, marginTop: 14 },
  item: { backgroundColor: colors.background, borderRadius: 14, padding: 14, gap: 8 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  itemLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.text },
  itemAmount: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted },
  released: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18, color: colors.accent },
  waiting: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18, color: colors.pending },
  payBox: { gap: 8, marginTop: 4 },
  hint: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, textAlign: 'center' },
})

InstallmentsCard.propTypes = {
  contract: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    freelancerName: PropTypes.string,
    clientName: PropTypes.string,
    studentAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    commissionAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    installments: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.number,
        label: PropTypes.string,
        clientAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        studentAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        commissionAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        reserveAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        releasedAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        status: PropTypes.string,
        payableNow: PropTypes.bool,
        paidAt: PropTypes.string,
      }),
    ),
  }).isRequired,
  isClient: PropTypes.bool,
  onPay: PropTypes.func.isRequired,
  paying: PropTypes.bool,
  awaitingPayment: PropTypes.bool,
  onVerify: PropTypes.func,
}
