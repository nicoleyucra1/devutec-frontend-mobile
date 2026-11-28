import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import NightCard from './NightCard'
import StatCard from './StatCard'
import PrimaryButton from '../PrimaryButton'
import StatusBadge from '../StatusBadge'
import { useMyContracts } from '../../hooks/useContracts'
import { useProjectsWithApplications } from '../../hooks/useProjectsWithApplications'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, formatWhen, pad, plural, sumBy } from '../../utils/format'
import { idType } from '../../utils/propShapes'

const PROJECT_STATUS = {
  OPEN: { label: 'Abierto', tone: 'success' },
  IN_PROGRESS: { label: 'En progreso', tone: 'progress' },
  DONE: { label: 'Terminado', tone: 'neutral' },
}

const pendingOf = (project) => (project.applications ?? []).filter((application) => application.status === 'PENDING')
const firstName = (name) => (name ?? '').split(' ')[0]

// Inicio del cliente (mockup M2): dinero en garantía, lo que tiene que revisar, sus postulaciones y sus proyectos
export default function ClientHome() {
  const router = useRouter()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const projects = useProjectsWithApplications()
  const contracts = useMyContracts()

  if (projects.loading || contracts.loading) {
    return <ActivityIndicator color={colors.text} style={styles.loading} />
  }

  const allProjects = projects.data ?? []
  const allContracts = contracts.data ?? []
  const thisYear = new Date().getFullYear()

  const held = allContracts.filter((contract) => contract.paymentStatus === 'HELD')
  // El backend no guarda la fecha en que se liberó el pago: se usa la de entrega, que es justo antes
  const paidThisYear = allContracts.filter(
    (contract) =>
      contract.paymentStatus === 'RELEASED' && new Date(contract.deliveredAt ?? contract.startedAt).getFullYear() === thisYear,
  )
  const open = allProjects.filter((project) => project.status === 'OPEN')
  const delivery = allContracts.find((contract) => contract.status === 'DELIVERED')

  const pending = open.flatMap(pendingOf)
  const top = [...open].sort((a, b) => pendingOf(b).length - pendingOf(a).length)[0]
  const allApplications = allProjects.flatMap((project) => project.applications ?? [])
  const average = allApplications.length ? sumBy(allApplications, (application) => application.proposedPrice) / allApplications.length : null

  return (
    <View style={styles.body}>
      {projects.error || contracts.error ? <Text style={styles.error}>{projects.error ?? contracts.error}</Text> : null}

      <NightCard
        label="EN GARANTÍA"
        lock
        corner={<Text style={styles.corner}>{`${held.length} ${plural(held.length, 'contrato', 'contratos')}`}</Text>}
        amount={sumBy(held, (contract) => contract.amount)}
        caption="Solo tú puedes liberarlo, después de revisar."
        stats={[
          { label: 'PAGADO ESTE AÑO', value: formatBudget(sumBy(paidThisYear, (contract) => contract.amount)) },
          { label: 'PROYECTOS ABIERTOS', value: pad(open.length) },
        ]}
      />

      {delivery ? (
        <ActionCard
          title={`${firstName(delivery.freelancerName) || 'Tu freelancer'} entregó “${delivery.projectTitle}”`}
          detail={
            <>
              Revisa y libera <Text style={styles.strong}>{formatBudget(delivery.amount)}</Text>
              {delivery.deliveredAt ? ` · ${formatWhen(delivery.deliveredAt)}` : ''}
            </>
          }
          onPress={() => router.push(`/contracts/${delivery.id}`)}
        />
      ) : pending.length > 0 && top ? (
        <ActionCard
          title={`${pendingOf(top).length} ${plural(pendingOf(top).length, 'postulación nueva', 'postulaciones nuevas')} en “${top.title}”`}
          detail="Revisa las propuestas y elige a tu freelancer"
          onPress={() => router.push(`/projects/${top.id}`)}
        />
      ) : null}

      <View style={styles.pair}>
        <StatCard
          label="POSTULACIONES"
          value={pad(pending.length)}
          highlight={pending.length > 0}
          note={pending.length > 0 && top ? `${pendingOf(top).length} para ${top.title}` : 'Sin postulaciones nuevas'}
        />
        <StatCard
          label="PROMEDIO"
          value={average === null ? '—' : `S/ ${Math.round(average)}`}
          note="por propuesta"
        />
      </View>

      <Text style={styles.heading}>Tus proyectos</Text>
      <View style={styles.rule} />
      {allProjects.slice(0, 4).map((project) => (
        <ProjectRow key={project.id} project={project} onPress={() => router.push(`/projects/${project.id}`)} />
      ))}
      {allProjects.length === 0 ? <Text style={styles.empty}>Todavía no publicas proyectos.</Text> : null}

      <PrimaryButton
        title="Publicar proyecto"
        onPress={() => router.push('/projects/asistente')}
        icon={<Ionicons name="add" size={20} color={colors.onPrimary} />}
        style={styles.publish}
      />
    </View>
  )
}

// Aviso con borde verde de lo que el cliente tiene que hacer ahora
function ActionCard({ title, detail, onPress }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>
        <Ionicons name="time-outline" size={20} color={colors.pending} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionLabel}>ACCIÓN REQUERIDA</Text>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text} />
    </Pressable>
  )
}

ActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  detail: PropTypes.node,
  onPress: PropTypes.func.isRequired,
}

function ProjectRow({ project, onPress }) {
  const styles = useThemedStyles(createStyles)
  const count = (project.applications ?? []).length
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.project, pressed && styles.pressed]}>
      <View style={styles.projectText}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {project.title}
        </Text>
        <Text style={styles.projectMeta}>
          {formatBudget(project.budget)} · {count} {plural(count, 'postulación', 'postulaciones')}
        </Text>
      </View>
      <StatusBadge status={PROJECT_STATUS[project.status]} fallback={project.status} />
    </Pressable>
  )
}

ProjectRow.propTypes = {
  project: PropTypes.shape({
    id: idType.isRequired,
    title: PropTypes.string,
    budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    applications: PropTypes.array,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  loading: { marginTop: 60 },
  body: { gap: 14, marginTop: 24 },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8 },
  corner: { fontFamily: fonts.semibold, fontSize: 12, color: colors.nightMuted },
  strong: { fontFamily: fonts.bold, color: colors.text },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 20,
    padding: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pendingLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  actionText: { flex: 1 },
  actionLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4, color: colors.pending },
  actionTitle: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.text, marginTop: 4 },
  actionDetail: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  pressed: { opacity: 0.75 },
  pair: { flexDirection: 'row', gap: 10 },
  heading: { fontFamily: fonts.medium, fontSize: 20, letterSpacing: -0.5, color: colors.text, marginTop: 18 },
  rule: { height: 2, backgroundColor: colors.border, marginTop: -4 },
  project: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  projectText: { flex: 1 },
  projectTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  projectMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 3 },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  publish: { marginTop: 6 },
})
