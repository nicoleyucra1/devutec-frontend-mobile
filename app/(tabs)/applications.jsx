import { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenState from '../../src/components/ScreenState'
import StatusBadge from '../../src/components/StatusBadge'
import { useMyApplications } from '../../src/hooks/useApplications'
import { applicationService } from '../../src/services/applicationService'
import { confirmAlert } from '../../src/utils/confirmAlert'
import { errorMessage } from '../../src/utils/errorMessage'
import { formatDate, formatMoney } from '../../src/utils/format'
import { APPLICATION_STATUS } from '../../src/utils/status'
import { colors } from '../../src/theme'

export default function MyApplicationsScreen() {
  const { data: applications, loading, error, reload } = useMyApplications()
  //id de la postulación que se está retirando, para mostrar su botón cargando
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

  if (loading || error) return <ScreenState loading={loading} error={error} onRetry={reload} />

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={applications}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
      ListHeaderComponent={actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      ListEmptyComponent={
        <ScreenState
          emptyTitle="Todavía no tienes postulaciones"
          emptyMessage="Entra a Proyectos y postula al que te interese."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.projectTitle}</Text>
            <StatusBadge status={APPLICATION_STATUS[item.status]} fallback={item.status} />
          </View>
          <Text style={styles.muted}>
            Tu precio: {formatMoney(item.proposedPrice)} · {formatDate(item.createdAt)}
          </Text>
          <Text style={styles.message} numberOfLines={3}>
            {item.message}
          </Text>
          {item.status === 'PENDING' && (
            <PrimaryButton
              title="Retirar postulación"
              variant="secondary"
              loading={withdrawingId === item.id}
              onPress={() => handleWithdraw(item)}
            />
          )}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, flexGrow: 1 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, marginTop: 4, fontSize: 13 },
  message: { color: colors.text, marginTop: 8 },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8 },
})