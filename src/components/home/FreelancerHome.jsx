import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import NightCard from './NightCard'
import StatCard from './StatCard'
import ContractCard from '../contracts/ContractCard'
import { useMyApplications } from '../../hooks/useApplications'
import { useMyContracts } from '../../hooks/useContracts'
import { useMyFreelancerProfile } from '../../hooks/useMyFreelancerProfile'
import { useReviewCount } from '../../hooks/useReviewCount'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, pad, plural, sumBy } from '../../utils/format'
import { idType } from '../../utils/propShapes'

const WEEK = 7 * 86_400_000
const ACTIVE = ['IN_PROGRESS', 'DELIVERED']

// El backend no guarda la fecha en que se liberó el pago: se usa la de entrega, que es justo antes
const releasedIn = (contracts, year, month) =>
  contracts.filter((contract) => {
    if (contract.paymentStatus !== 'RELEASED') return false
    const date = new Date(contract.deliveredAt ?? contract.startedAt)
    return date.getFullYear() === year && date.getMonth() === month
  })

// Qué le falta al contrato: si ya entregó, esperar al cliente; si no, cuántos días quedan
function contractNote(contract) {
  if (contract.status === 'DELIVERED') return 'Esperando revisión'
  if (!contract.deadline) return 'Sin fecha límite'
  const [year, month, day] = contract.deadline.slice(0, 10).split('-').map(Number)
  const today = new Date()
  const days = Math.round((new Date(year, month - 1, day) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000)
  if (days < 0) return `Venció hace ${-days} ${plural(-days, 'día', 'días')}`
  if (days === 0) return 'Vence hoy'
  return `${days} ${plural(days, 'día', 'días')} para entregar`
}

// Inicio del freelancer (mockup M2): lo liberado este mes, su dinero en garantía, valoración, postulaciones
// y los contratos en curso
export default function FreelancerHome({ userId }) {
  const router = useRouter()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const contracts = useMyContracts()
  const applications = useMyApplications()
  const profile = useMyFreelancerProfile()
  const reviews = useReviewCount(userId)

  if (contracts.loading || applications.loading) {
    return <ActivityIndicator color={colors.text} style={styles.loading} />
  }

  const allContracts = contracts.data ?? []
  const allApplications = applications.data ?? []
  const now = new Date()
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonth = sumBy(releasedIn(allContracts, now.getFullYear(), now.getMonth()), (contract) => contract.amount)
  const lastMonth = sumBy(releasedIn(allContracts, lastMonthDate.getFullYear(), lastMonthDate.getMonth()), (contract) => contract.amount)
  const lastMonthName = lastMonthDate.toLocaleDateString('es-PE', { month: 'long' }).toLowerCase()
  const held = allContracts.filter((contract) => contract.paymentStatus === 'HELD')
  const active = allContracts.filter((contract) => ACTIVE.includes(contract.status))
  const sentThisWeek = allApplications.filter((application) => now - new Date(application.createdAt) < WEEK).length

  const rating = Number(profile.data?.calificacionPromedio)
  const reviewCount = reviews.data ?? 0

  return (
    <View style={styles.body}>
      {contracts.error || applications.error ? <Text style={styles.error}>{contracts.error ?? applications.error}</Text> : null}

      <NightCard
        label="LIBERADO ESTE MES"
        corner={
          thisMonth > lastMonth ? (
            <Text style={styles.pill}>+{formatBudget(thisMonth - lastMonth)}</Text>
          ) : null
        }
        amount={thisMonth}
        caption={`vs. ${formatBudget(lastMonth)} en ${lastMonthName}`}
        stats={[
          { label: 'EN GARANTÍA', lock: true, value: formatBudget(sumBy(held, (contract) => contract.amount)) },
          { label: 'CONTRATOS ACTIVOS', value: pad(active.length) },
        ]}
      />

      <View style={styles.pair}>
        <StatCard
          label="VALORACIÓN"
          value={rating > 0 ? rating.toFixed(1) : '—'}
          suffix={rating > 0 ? <Ionicons name="star" size={18} color={colors.pending} /> : null}
          note={reviewCount > 0 ? `${reviewCount} ${plural(reviewCount, 'reseña', 'reseñas')}` : 'Aún sin reseñas'}
        />
        <StatCard
          label="POSTULACIONES"
          value={pad(allApplications.length)}
          highlight={allApplications.length > 0}
          note={`${sentThisWeek} ${plural(sentThisWeek, 'enviada', 'enviadas')} esta semana`}
        />
      </View>

      <View style={styles.headingRow}>
        <Text style={styles.heading}>En curso</Text>
        <Pressable onPress={() => router.push('/contracts')} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.link}>Ver todos</Text>
        </Pressable>
      </View>
      {active.length === 0 ? (
        <EmptyActive onPress={() => router.push('/projects')} />
      ) : (
        active.slice(0, 3).map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            meta={[contract.clientName, contractNote(contract)].filter(Boolean).join(' · ')}
            onPress={() => router.push(`/contracts/${contract.id}`)}
          />
        ))
      )}
    </View>
  )
}

FreelancerHome.propTypes = {
  userId: idType.isRequired,
}

function EmptyActive({ onPress }) {
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.empty, pressed && { opacity: 0.75 }]}>
      <Text style={styles.emptyTitle}>No tienes contratos en curso</Text>
      <Text style={styles.emptyText}>Busca un proyecto y postula →</Text>
    </Pressable>
  )
}

EmptyActive.propTypes = {
  onPress: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  loading: { marginTop: 60 },
  body: { gap: 14, marginTop: 24 },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8 },
  pill: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.lime,
    backgroundColor: '#2A3311',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pair: { flexDirection: 'row', gap: 10 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 },
  heading: { fontFamily: fonts.medium, fontSize: 20, letterSpacing: -0.5, color: colors.text },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inputBorder, borderRadius: 18, padding: 18 },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.accent, marginTop: 4 },
})
