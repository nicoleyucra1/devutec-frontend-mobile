import { Linking, Pressable, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import StatusBadge from '../StatusBadge'
import { useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, formatDate } from '../../utils/format'
import { STAGE_STATUS } from '../../utils/status'

// Etapas del contrato (igual que en la web): Descubrimiento → Diseño → Desarrollo → Entrega final.
// Cada etapa se entrega y el cliente la aprueba (se libera su parte) o pide cambios (máximo 2 rondas).
// Arriba, cuánto suman las etapas aprobadas; abajo, la bolsa de emergencia.
export default function StagesCard({ contract, isClient }) {
  const styles = useThemedStyles(createStyles)
  const stages = contract.stages ?? []
  // Contratos de antes de las etapas: una sola etapa del 100 %, no hace falta la lista
  if (stages.length <= 1) return null

  const finished = contract.status === 'CONFIRMED'
  const released = finished ? Number(contract.amount) : Number(contract.releasedAmount ?? 0)
  const fund = Number(contract.emergencyFund ?? 0)
  const freelancer = contract.freelancerName?.split(' ')[0] ?? 'el estudiante'

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>ETAPAS DEL TRABAJO</Text>
      <Text style={styles.title}>{finished ? 'Todas las etapas aprobadas' : 'Pagas por avance: cada etapa se aprueba por separado'}</Text>
      <Text style={styles.small}>
        Etapas aprobadas: <Text style={styles.strong}>{formatBudget(released)}</Text> de {formatBudget(contract.amount)}
      </Text>

      {stages.map((stage) => {
        const current = stage.position === contract.currentStage
        const rounds = stage.changeRounds ?? 0
        const maxRounds = stage.maxChangeRounds ?? 2
        const details = [
          stage.dueDate ? `Para el ${formatDate(stage.dueDate)}` : 'Sin fecha',
          stage.approvedAt ? `Aprobada el ${formatDate(stage.approvedAt)}` : null,
          rounds > 0 ? `${rounds} de ${maxRounds} rondas de cambios` : null,
        ].filter(Boolean)
        return (
          <View key={stage.id ?? stage.position} style={[styles.stage, current && styles.stageCurrent]}>
            <View style={styles.row}>
              <Text style={styles.stageName}>
                {stage.position}. {stage.name} <Text style={styles.percent}>{stage.percentage} %</Text>
              </Text>
              <Text style={styles.amount}>{formatBudget(stage.amount)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.small}>{details.join(' · ')}</Text>
              <StatusBadge status={STAGE_STATUS[stage.status]} fallback={stage.status} />
            </View>
            {stage.status === 'CHANGES_REQUESTED' && stage.changeRequestNote ? (
              <Text style={styles.changes}>
                <Text style={styles.strong}>Cambios pedidos: </Text>
                {stage.changeRequestNote}
              </Text>
            ) : null}
            {stage.deliveryUrl && stage.status !== 'PENDING' ? (
              <Pressable onPress={() => Linking.openURL(stage.deliveryUrl).catch(() => {})} accessibilityRole="link" hitSlop={6}>
                <Text style={styles.link} numberOfLines={1}>
                  {stage.status === 'APPROVED' ? 'Entrega aprobada' : 'Última entrega'}: {stage.deliveryUrl.replace(/^https?:\/\//, '')} ↗
                </Text>
              </Pressable>
            ) : null}
          </View>
        )
      })}

      {fund > 0 ? (
        <View style={styles.fund}>
          <View style={styles.row}>
            <Text style={styles.fundTitle}>Bolsa de emergencia · 10 %</Text>
            <Text style={styles.fundTitle}>{formatBudget(fund)}</Text>
          </View>
          <Text style={styles.fundText}>
            Se paga al inicio y se libera a {freelancer} al terminar.{' '}
            {isClient ? 'Si el proyecto se detiene, con ella se le paga lo que ya entregó.' : 'Te protege si el proyecto se detiene.'}
          </Text>
        </View>
      ) : null}
      <Text style={styles.small}>Los montos son lo que paga el cliente e incluyen la tarifa de DEVUTEC.</Text>
    </View>
  )
}

StagesCard.propTypes = {
  contract: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    currentStage: PropTypes.number,
    releasedAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    emergencyFund: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    freelancerName: PropTypes.string,
    stages: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  isClient: PropTypes.bool,
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 8 },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  title: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  stage: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 14, padding: 12, gap: 6 },
  stageCurrent: { borderColor: colors.text, backgroundColor: colors.card },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  stageName: { flexShrink: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  percent: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  amount: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  small: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  strong: { fontFamily: fonts.semibold, color: colors.text },
  changes: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.pending, backgroundColor: colors.pendingLight, borderRadius: 10, padding: 8, overflow: 'hidden' },
  link: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accent, textDecorationLine: 'underline' },
  fund: { backgroundColor: colors.pendingLight, borderRadius: 14, padding: 12, gap: 4 },
  fundTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.pending },
  fundText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.pending },
})
