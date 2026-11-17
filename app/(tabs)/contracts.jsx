import { useEffect } from 'react'
import { FlatList, RefreshControl, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PropTypes from 'prop-types'
import Money from '../../src/components/Money'
import ScreenState from '../../src/components/ScreenState'
import ContractCard from '../../src/components/contracts/ContractCard'
import OfflineBanner from '../../src/components/contracts/OfflineBanner'
import TimeoutCard from '../../src/components/contracts/TimeoutCard'
import api from '../../src/services/api'
import { useAuth } from '../../src/hooks/useAuth'
import { useMyContracts } from '../../src/hooks/useContracts'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { contractsCache, savedAgo } from '../../src/utils/contractsCache'
import { contractCode, formatShortDate, plural, sumBy } from '../../src/utils/format'

const ACTIVE = ['IN_PROGRESS', 'DELIVERED']
// Primero lo que hay que revisar, luego lo que está en curso y al final lo cerrado
const ORDER = { DELIVERED: 0, IN_PROGRESS: 1, CONFIRMED: 2, CANCELLED: 3 }

// Detalle de cada tarjeta: qué le toca a quien mira y cuándo vence o se cerró
function contractNote(contract, isClient) {
  switch (contract.status) {
    case 'DELIVERED':
      return isClient ? 'revisa la entrega' : 'esperando revisión'
    case 'IN_PROGRESS':
      return contract.deadline ? `vence ${formatShortDate(contract.deadline)}` : 'sin fecha límite'
    case 'CONFIRMED':
      return formatShortDate(contract.deliveredAt ?? contract.startedAt)
    case 'CANCELLED':
      return 'cancelado'
    default:
      return null
  }
}

// Contratos (mockup M9): el dinero en garantía y cada contrato con su estado y su pago.
// Sin conexión muestra los últimos datos guardados con un aviso; si el servidor no responde a tiempo,
// la tarjeta de "Tiempo agotado".
export default function MyContractsScreen() {
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { data, loading, error, kind, reload } = useMyContracts()
  const isClient = user?.rol === 'CLIENT'

  useEffect(() => {
    if (data) contractsCache.save(data)
  }, [data])

  const cached = contractsCache.get()
  const offline = kind === 'offline' && cached
  // Mientras recarga o sin conexión se siguen mostrando los últimos contratos guardados
  const source = data ?? ((loading || offline) && cached ? cached.contracts : null)
  const contracts = source ? [...source].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9)) : null

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.heading} accessibilityRole="header">
        Contratos
      </Text>
      <Text style={styles.role}>{isClient ? 'Como cliente' : 'Como freelancer'}</Text>
    </View>
  )

  if (kind === 'timeout') {
    return (
      <View style={[styles.list, styles.padded]}>
        {header}
        <TimeoutCard
          seconds={Math.round(api.defaults.timeout / 1000)}
          heldAmount={cached ? sumBy(cached.contracts.filter((c) => c.paymentStatus === 'HELD'), (c) => c.amount) : 0}
          onRetry={reload}
        />
      </View>
    )
  }

  if (!contracts) {
    return (
      <View style={styles.list}>
        <View style={styles.padded}>{header}</View>
        <ScreenState loading={loading} error={error} onRetry={reload} />
      </View>
    )
  }

  const held = contracts.filter((contract) => contract.paymentStatus === 'HELD')
  const active = contracts.filter((contract) => ACTIVE.includes(contract.status)).length

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={contracts}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
      ListHeaderComponent={
        <View style={styles.top}>
          {header}
          {offline ? <OfflineBanner savedAgo={savedAgo(cached.savedAt)} onRetry={reload} /> : null}
          <View style={offline && styles.dimmed}>
            <EscrowSummary amount={sumBy(held, (contract) => contract.amount)} active={active} />
          </View>
        </View>
      }
      ListEmptyComponent={
        <ScreenState
          emptyTitle="Todavía no tienes contratos"
          emptyMessage={
            isClient
              ? 'Cuando aceptes una postulación, el contrato aparecerá aquí.'
              : 'Cuando un cliente acepte tu postulación, el contrato aparecerá aquí.'
          }
        />
      }
      ItemSeparatorComponent={() => <View style={styles.gap} />}
      renderItem={({ item }) => (
        <View style={offline && styles.dimmed}>
          <ContractCard
            contract={item}
            showPayment
            highlight={isClient && item.status === 'DELIVERED'}
            meta={[contractCode(item.id), isClient ? item.freelancerName : item.clientName, contractNote(item, isClient)]
              .filter(Boolean)
              .join(' · ')}
            // Sin conexión el detalle no cargaría: las tarjetas quedan solo para mirar
            onPress={offline ? undefined : () => router.push(`/contracts/${item.id}`)}
          />
        </View>
      )}
    />
  )
}

// Total en garantía de los contratos con el pago retenido
function EscrowSummary({ amount, active }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.summary}>
      <View style={styles.summaryLabelRow}>
        <Ionicons name="lock-closed-outline" size={13} color={colors.accent} />
        <Text style={styles.summaryLabel}>EN GARANTÍA</Text>
      </View>
      <View style={styles.summaryRow}>
        <Money value={amount} style={styles.summaryAmount} centsStyle={styles.cents} />
        <Text style={styles.summaryNote}>
          {active} {plural(active, 'activo', 'activos')}
        </Text>
      </View>
    </View>
  )
}

EscrowSummary.propTypes = {
  amount: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  list: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 110, flexGrow: 1 },
  top: { gap: 14, marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 4 },
  heading: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1.6, color: colors.text },
  role: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 6 },
  dimmed: { opacity: 0.6 },
  gap: { height: 14 },
  summary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  summaryAmount: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1.6, color: colors.text },
  cents: { color: colors.muted },
  summaryNote: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: 6 },
})
