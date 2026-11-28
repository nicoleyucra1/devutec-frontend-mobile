import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import Avatar from '../Avatar'
import PrimaryButton from '../PrimaryButton'
import ProposalExplainer from './ProposalExplainer'
import StatusBadge from '../StatusBadge'
import { applicationService } from '../../services/applicationService'
import { useProjectApplicants } from '../../hooks/useProjectApplicants'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { confirmAlert } from '../../utils/confirmAlert'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatWhen } from '../../utils/format'
import { idType } from '../../utils/propShapes'
import { APPLICATION_STATUS } from '../../utils/status'

// Primero las pendientes y, dentro de cada estado, las más nuevas arriba
const ORDER = { PENDING: 0, ACCEPTED: 1, REJECTED: 2 }
const byStatusThenDate = (a, b) =>
  (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || new Date(b.createdAt) - new Date(a.createdAt)

// ¿La propuesta cambia el precio o el plazo del proyecto?
function changesProposal(application, project) {
  const deadline = application.projectDeadline ?? project.deadline
  return (
    Number(application.proposedPrice) !== Number(application.projectBudget ?? project.budget) ||
    Boolean(application.proposedDeadline && deadline && application.proposedDeadline !== deadline)
  )
}

// "Postulaciones" en el detalle del proyecto, solo para el cliente dueño: cada freelancer con su precio y su
// mensaje. Mientras el proyecto está abierto, puede elegir a uno (se crea el contrato y el resto se rechaza)
// o rechazar una postulación.
export default function ProjectApplicants({ project, onChanged }) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const { data, loading, error, reload } = useProjectApplicants(project.id)
  const [busy, setBusy] = useState(null) // { id, action } mientras se acepta o rechaza
  const [actionError, setActionError] = useState(null)
  const canDecide = project.status === 'OPEN'
  const applications = data ? [...data].sort(byStatusThenDate) : []
  const pending = applications.filter((application) => application.status === 'PENDING').length

  const run = async (application, action) => {
    const name = application.freelancerName || 'este freelancer'
    const confirmed =
      action === 'accept'
        ? await confirmAlert(
            `¿Elegir a ${name}?`,
            `Se crea el contrato por ${formatBudget(application.proposedPrice)} y las demás postulaciones se rechazan.`,
            'Elegir',
          )
        : await confirmAlert(`¿Rechazar a ${name}?`, 'Le avisaremos que elegiste otra propuesta.', 'Rechazar')
    if (!confirmed) return

    setBusy({ id: application.id, action })
    setActionError(null)
    try {
      if (action === 'accept') {
        await applicationService.accept(application.id)
        // El contrato ya existe: se va a Contratos para pagar y seguir el trabajo
        router.push('/contracts')
      } else {
        await applicationService.reject(application.id)
      }
      reload()
      onChanged?.()
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Postulaciones</Text>
        {data ? (
          <Text style={styles.count}>
            {applications.length === 0 ? 'Ninguna todavía' : `${pending} pendiente${pending === 1 ? '' : 's'} de ${applications.length}`}
          </Text>
        ) : null}
      </View>

      {loading ? <ActivityIndicator color={colors.muted} style={styles.loading} /> : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={reload} accessibilityRole="button">
            <Text style={styles.retry}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {data && applications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="paper-plane-outline" size={22} color={colors.muted} />
          <Text style={styles.emptyText}>
            Cuando un freelancer postule, verás aquí su propuesta y podrás elegirlo.
          </Text>
        </View>
      ) : null}

      {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

      {applications.map((application) => {
        const decidable = canDecide && application.status === 'PENDING'
        const isBusy = busy?.id === application.id
        return (
          <View key={application.id} style={styles.card}>
            <Pressable
              onPress={() => router.push(`/freelancers/${application.freelancerUserId}`)}
              accessibilityRole="button"
              accessibilityLabel={`Ver el perfil de ${application.freelancerName}`}
              style={({ pressed }) => [styles.who, pressed && styles.pressed]}
            >
              <Avatar name={application.freelancerName} src={`/api/v1/users/${application.freelancerUserId}/avatar`} size={44} />
              <View style={styles.flex}>
                <Text style={styles.name} numberOfLines={1}>
                  {application.freelancerName}
                </Text>
                <Text style={styles.meta}>
                  Ver perfil · {formatWhen(application.createdAt)}
                </Text>
              </View>
              <StatusBadge status={APPLICATION_STATUS[application.status]} fallback={application.status} />
            </Pressable>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Propone</Text>
              <Text style={styles.price}>{formatBudget(application.proposedPrice)}</Text>
              {Number(application.proposedPrice) !== Number(project.budget) ? (
                <Text style={styles.budget}>tu presupuesto: {formatBudget(project.budget)}</Text>
              ) : null}
            </View>
            <Text style={styles.message}>{application.message}</Text>
            {/* Si propone otro precio u otro plazo, Cuyi le explica al cliente qué cambia y por qué */}
            {decidable && changesProposal(application, project) ? (
              <ProposalExplainer applicationId={application.id} freelancerName={application.freelancerName} />
            ) : null}

            {decidable ? (
              <View style={styles.actions}>
                <PrimaryButton
                  title="Elegir"
                  onPress={() => run(application, 'accept')}
                  loading={isBusy && busy.action === 'accept'}
                  disabled={busy !== null}
                  style={styles.flex}
                />
                <PrimaryButton
                  title="Rechazar"
                  variant="secondary"
                  onPress={() => run(application, 'reject')}
                  loading={isBusy && busy.action === 'reject'}
                  disabled={busy !== null}
                  style={styles.flex}
                />
              </View>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

ProjectApplicants.propTypes = {
  project: PropTypes.shape({
    id: idType.isRequired,
    status: PropTypes.string,
    budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onChanged: PropTypes.func,
}

const createStyles = ({ colors, fonts, radius }) => ({
  section: { gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  count: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  loading: { marginVertical: 12 },
  flex: { flex: 1 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.7 },
  name: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
  meta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
  priceLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  price: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.6 },
  budget: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  message: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
  },
  emptyText: { flex: 1, color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  errorBox: { backgroundColor: colors.errorLight, borderRadius: radius.md, padding: 14, gap: 6 },
  errorText: { color: colors.error, fontFamily: fonts.medium },
  retry: { color: colors.text, fontFamily: fonts.bold, textDecorationLine: 'underline' },
  actionError: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8, overflow: 'hidden' },
})
