import { useState } from 'react'
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PropTypes from 'prop-types'
import Money from '../../src/components/Money'
import ScreenState from '../../src/components/ScreenState'
import StatusBadge from '../../src/components/StatusBadge'
import { useMyApplicationsWithProjects } from '../../src/hooks/useMyApplicationsWithProjects'
import { applicationService } from '../../src/services/applicationService'
import { confirmAlert } from '../../src/utils/confirmAlert'
import { errorMessage } from '../../src/utils/errorMessage'
import { formatBudget, formatShortDate } from '../../src/utils/format'
import { idType } from '../../src/utils/propShapes'
import { APPLICATION_STATUS, PAYMENT_STATUS } from '../../src/utils/status'
import { useThemedStyles } from '../../src/hooks/useTheme'

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'ACCEPTED', label: 'Aceptadas' },
  { key: 'REJECTED', label: 'Rechazadas' },
]

// Mis postulaciones (mockup M5): cada propuesta con su monto, el proyecto y qué se puede hacer con ella.
// Pendiente → Retirar; aceptada → ir al contrato.
export default function MyApplicationsScreen() {
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { data: applications, loading, error, reload } = useMyApplicationsWithProjects()
  const [filter, setFilter] = useState('ALL')
  // id de la postulación que se está retirando, para mostrar su botón cargando
  const [withdrawingId, setWithdrawingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const handleWithdraw = async (application) => {
    const ok = await confirmAlert(
      '¿Retirar tu postulación?',
      `Se eliminará tu postulación a "${application.projectTitle}".`,
      'Sí, retirar',
    )
    if (!ok) return

    setWithdrawingId(application.id)
    setActionError(null)
    try {
      await applicationService.withdraw(application.id)
      reload()
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setWithdrawingId(null)
    }
  }

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.heading} accessibilityRole="header">
        Mis postulaciones
      </Text>
    </View>
  )

  if (loading || error) {
    return (
      <View style={styles.list}>
        {header}
        <ScreenState loading={loading} error={error} onRetry={reload} />
      </View>
    )
  }

  const all = applications ?? []
  const shown = filter === 'ALL' ? all : all.filter((application) => application.status === filter)

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={shown}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
      ListHeaderComponent={
        <>
          {header}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsRow}>
            {FILTERS.map((item) => {
              const count = item.key === 'ALL' ? all.length : all.filter((application) => application.status === item.key).length
              const selected = filter === item.key
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setFilter(item.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={[styles.tab, selected && styles.tabSelected]}
                >
                  <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                    {item.label} {count}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
        </>
      }
      ListEmptyComponent={
        <ScreenState
          emptyTitle={filter === 'ALL' ? 'Todavía no tienes postulaciones' : 'No hay postulaciones aquí'}
          emptyMessage={filter === 'ALL' ? 'Entra a Proyectos y postula al que te interese.' : 'Prueba con otro filtro.'}
        />
      }
      ItemSeparatorComponent={() => <View style={styles.gap} />}
      renderItem={({ item }) => (
        <ApplicationCard application={item} withdrawing={withdrawingId === item.id} onWithdraw={() => handleWithdraw(item)} />
      )}
    />
  )
}

function ApplicationCard({ application, withdrawing, onWithdraw }) {
  const styles = useThemedStyles(createStyles)
  const { project, contract } = application
  const meta = [
    project?.clientName,
    project ? `presupuesto ${formatBudget(project.budget)}` : null,
    formatShortDate(application.createdAt),
  ]
    .filter(Boolean)
    .join(' · ')
  const payment = PAYMENT_STATUS[contract?.paymentStatus]

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.label}>TU PROPUESTA</Text>
        <StatusBadge status={APPLICATION_STATUS[application.status]} fallback={application.status} />
      </View>
      <Money value={application.proposedPrice} style={styles.amount} />
      <Text style={styles.title} numberOfLines={2}>
        {application.projectTitle}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {meta}
      </Text>

      {application.status === 'PENDING' ? (
        <Pressable
          onPress={onWithdraw}
          disabled={withdrawing}
          accessibilityRole="button"
          style={({ pressed }) => [styles.withdraw, (pressed || withdrawing) && styles.pressed]}
        >
          <Text style={styles.withdrawText}>{withdrawing ? 'Retirando…' : 'Retirar'}</Text>
        </Pressable>
      ) : null}

      {application.status === 'ACCEPTED' ? (
        <Pressable
          onPress={() => router.push(contract ? `/contracts/${contract.id}` : '/contracts')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.contract, pressed && styles.pressed]}
        >
          <Text style={styles.contractText}>
            Ver contrato{payment ? ` · ${payment.label.replace('Pago ', 'pago ')}` : ''}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

ApplicationCard.propTypes = {
  application: PropTypes.shape({
    id: idType.isRequired,
    projectTitle: PropTypes.string,
    proposedPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    createdAt: PropTypes.string,
    project: PropTypes.shape({ clientName: PropTypes.string, budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }),
    contract: PropTypes.shape({ id: idType, paymentStatus: PropTypes.string }),
  }).isRequired,
  withdrawing: PropTypes.bool,
  onWithdraw: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  list: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 110, flexGrow: 1 },
  header: { paddingBottom: 18 },
  heading: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1.6, color: colors.text, paddingHorizontal: 0 },
  tabs: { marginHorizontal: -20, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsRow: { paddingHorizontal: 20, gap: 18 },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabSelected: { borderBottomColor: colors.text },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  tabTextSelected: { fontFamily: fonts.semibold, color: colors.text },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8, marginBottom: 12 },
  gap: { height: 14 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  amount: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -1.2, color: colors.text, marginTop: 6 },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginTop: 12 },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  pressed: { opacity: 0.7 },
  withdraw: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  withdrawText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.error },
  contract: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contractText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
})
