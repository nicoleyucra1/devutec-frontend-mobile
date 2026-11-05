import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { router } from 'expo-router'
import ScreenState from '../../src/components/ScreenState'
import StatusBadge from '../../src/components/StatusBadge'
import { useAuth } from '../../src/hooks/useAuth'
import { useMyContracts } from '../../src/hooks/useContracts'
import { formatDate, formatBudget } from '../../src/utils/format'
import { CONTRACT_STATUS, PAYMENT_STATUS } from '../../src/utils/status'
import { useThemedStyles } from '../../src/hooks/useTheme'

export default function MyContractsScreen() {
  const styles = useThemedStyles(createStyles)
  const { user } = useAuth()
  const { data: contracts, loading, error, reload } = useMyContracts()
  const isClient = user?.rol === 'CLIENT'

  if (loading || error) return <ScreenState loading={loading} error={error} onRetry={reload} />

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={contracts}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
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
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/contracts/${item.id}`)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.row}>
            <Text style={styles.title}>{item.projectTitle}</Text>
            <StatusBadge status={CONTRACT_STATUS[item.status]} fallback={item.status} />
          </View>
          <Text style={styles.muted}>
            {isClient ? `Freelancer: ${item.freelancerName}` : 'Tú eres el freelancer'} · {formatDate(item.startedAt)}
          </Text>
          <View style={[styles.row, styles.payment]}>
            <Text style={styles.amount}>{formatBudget(item.amount)}</Text>
            <StatusBadge status={PAYMENT_STATUS[item.paymentStatus]} fallback={item.paymentStatus} />
          </View>
        </Pressable>
      )}
    />
  )
}

const createStyles = ({ colors, fonts }) => ({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, flexGrow: 1 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16 },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 16, fontFamily: fonts.semibold, color: colors.text },
  muted: { color: colors.muted, marginTop: 4, fontSize: 13 },
  payment: { marginTop: 10, justifyContent: 'flex-start' },
  amount: { fontFamily: fonts.bold, color: colors.text },
})