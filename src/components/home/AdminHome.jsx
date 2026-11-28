import { ActivityIndicator, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import NightCard from './NightCard'
import StatCard from './StatCard'
import PrimaryButton from '../PrimaryButton'
import StatusBadge from '../StatusBadge'
import { useAsync } from '../../hooks/useAsync'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { paymentService } from '../../services/paymentService'
import { projectService } from '../../services/projectService'
import { formatBudget, formatWhen, pad, plural, sumBy } from '../../utils/format'
import { idType } from '../../utils/propShapes'
import { PAYMENT_STATUS } from '../../utils/status'

// Inicio del admin (mismo estilo que el del cliente y el freelancer): el dinero que mueve la plataforma,
// cuántos proyectos hay y los últimos pagos. Los proyectos se revisan (y se eliminan) desde la pestaña Proyectos.
export default function AdminHome() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const payments = useAsync((options) => paymentService.getAll(options), [])
  // Solo hace falta el total, así que se pide una página de un proyecto
  const projects = useAsync((options) => projectService.getAll({ page: 1, size: 1 }, options), [])

  if (payments.loading && !payments.data) return <ActivityIndicator style={styles.loading} color={colors.muted} />

  const list = payments.data ?? []
  const byStatus = (status) => list.filter((payment) => payment.status === status)
  const held = byStatus('HELD')
  const released = byStatus('RELEASED')
  const refunded = byStatus('REFUNDED')
  const latest = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  const totalProjects = projects.data?.totalElements

  return (
    <View style={styles.body}>
      {payments.error ? <Text style={styles.error}>{payments.error}</Text> : null}

      <NightCard
        label="EN GARANTÍA EN DEVUTEC"
        lock
        corner={<Text style={styles.corner}>{held.length} {plural(held.length, 'pago', 'pagos')}</Text>}
        amount={sumBy(held, (payment) => payment.amount)}
        caption="Retenido hasta que cada cliente apruebe la entrega"
        stats={[
          { label: 'LIBERADO', value: formatBudget(sumBy(released, (payment) => payment.amount)) },
          { label: 'REEMBOLSADO', value: formatBudget(sumBy(refunded, (payment) => payment.amount)) },
        ]}
      />

      <View style={styles.pair}>
        <StatCard
          label="PROYECTOS"
          value={totalProjects === undefined ? '—' : pad(totalProjects)}
          note="en la plataforma"
        />
        <StatCard label="PAGOS" value={pad(list.length)} note={`${released.length} ${plural(released.length, 'liberado', 'liberados')}`} />
      </View>

      <Text style={styles.heading}>Últimos pagos</Text>
      <View style={styles.rule} />
      {latest.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} />
      ))}
      {list.length === 0 && !payments.error ? <Text style={styles.empty}>Todavía no hay pagos.</Text> : null}

      {/* Carnets universitarios por revisar (segunda verificación del estudiante) */}
      <PrimaryButton
        title="Revisar carnets"
        onPress={() => router.push('/admin/carnets')}
        style={styles.button}
      />
      <PrimaryButton
        title="Revisar proyectos"
        variant="secondary"
        onPress={() => router.push('/projects')}
        icon={<Ionicons name="briefcase-outline" size={18} color={colors.text} />}
        style={styles.button}
      />
    </View>
  )
}

// Un pago: proyecto, quién paga a quién, cuándo, monto y estado
function PaymentRow({ payment }) {
  const styles = useThemedStyles(createStyles)
  const people = [payment.clientName, payment.freelancerName].filter(Boolean).join(' → ')
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {payment.projectTitle ?? `Pago #${payment.id}`}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {[people, formatWhen(payment.createdAt)].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View style={styles.rowEnd}>
        <Text style={styles.amount}>{formatBudget(payment.amount)}</Text>
        <StatusBadge status={PAYMENT_STATUS[payment.status]} fallback={payment.status} />
      </View>
    </View>
  )
}

PaymentRow.propTypes = {
  payment: PropTypes.shape({
    id: idType.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    createdAt: PropTypes.string,
    projectTitle: PropTypes.string,
    clientName: PropTypes.string,
    freelancerName: PropTypes.string,
  }).isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  loading: { marginTop: 60 },
  body: { gap: 14, marginTop: 24 },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8 },
  corner: { fontFamily: fonts.semibold, fontSize: 12, color: colors.nightMuted },
  pair: { flexDirection: 'row', gap: 10 },
  heading: { fontFamily: fonts.medium, fontSize: 20, letterSpacing: -0.5, color: colors.text, marginTop: 18 },
  rule: { height: 2, backgroundColor: colors.border, marginTop: -4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  rowMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 3 },
  rowEnd: { alignItems: 'flex-end', gap: 6 },
  amount: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  button: { marginTop: 8 },
})
