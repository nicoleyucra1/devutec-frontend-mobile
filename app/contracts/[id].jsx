import { useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenState from '../../src/components/ScreenState'
import StatusBadge from '../../src/components/StatusBadge'
import { useAuth } from '../../src/hooks/useAuth'
import { useBiometricAuth } from '../../src/hooks/useBiometricAuth'
import { useContract } from '../../src/hooks/useContracts'
import { contractService } from '../../src/services/contractService'
import { confirmAlert } from '../../src/utils/confirmAlert'
import { errorMessage } from '../../src/utils/errorMessage'
import { formatDate, formatBudget } from '../../src/utils/format'
import { CONTRACT_STATUS, PAYMENT_STATUS } from '../../src/utils/status'
import { useThemedStyles } from '../../src/hooks/useTheme'

const PAYMENT_TEXT = {
  HELD: 'DevUTEC guarda el pago hasta que el cliente confirme la entrega.',
  RELEASED: 'El pago ya fue entregado al freelancer.',
  REFUNDED: 'El pago fue devuelto al cliente.',
}

export default function ContractDetailScreen() {
  const styles = useThemedStyles(createStyles)
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const biometric = useBiometricAuth()
  const { data: contract, loading, error, reload } = useContract(id)

  // Acción en curso ('deliver', 'confirm' o 'cancel'); su botón muestra que está cargando
  const [running, setRunning] = useState(null)
  const [message, setMessage] = useState(null)

  // Llama al endpoint de la acción y muestra el resultado arriba
  const run = async (type, request, successText) => {
    setRunning(type)
    setMessage(null)
    try {
      await request(id)
      setMessage({ ok: true, text: successText })
      reload()
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setRunning(null)
    }
  }

  const handleDeliver = () =>
    run('deliver', contractService.deliver, 'Marcaste el trabajo como entregado. El cliente debe confirmarlo.')

  // Liberar el pago es la acción más delicada: se confirma con huella, Face ID o el código del celular
  const handleConfirm = async () => {
    const result = await biometric.confirm({
      title: 'Confirmar entrega y liberar pago',
      message: `Se pagarán ${formatBudget(contract.amount)} a ${contract.freelancerName}`,
      confirmLabel: 'Liberar pago',
    })
    if (result.ok) {
      run('confirm', contractService.confirm, 'Entrega confirmada. El pago fue liberado al freelancer.')
    } else if (result.error) {
      setMessage({ ok: false, text: result.error })
    }
  }

  const handleCancel = async () => {
    const ok = await confirmAlert(
      '¿Cancelar el contrato?',
      `Se te devolverán ${formatBudget(contract.amount)} y el proyecto volverá a estar abierto.`,
      'Sí, cancelar',
    )
    if (ok) run('cancel', contractService.cancel, 'Contrato cancelado. El pago fue reembolsado.')
  }

  if (loading || error) return <ScreenState loading={loading} error={error} onRetry={reload} />

  // El rol en este contrato se decide con los ids que manda el backend
  const isClient = user?.id === contract.clientId
  const isFreelancer = user?.id === contract.freelancerUserId
  const canDeliver = isFreelancer && contract.status === 'IN_PROGRESS'
  const canCancel = isClient && contract.status === 'IN_PROGRESS'
  const canConfirm = isClient && contract.status === 'DELIVERED'

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
    >
      {message && <Text style={[styles.message, message.ok ? styles.success : styles.error]}>{message.text}</Text>}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{contract.projectTitle}</Text>
          <StatusBadge status={CONTRACT_STATUS[contract.status]} fallback={contract.status} />
        </View>

        <View style={styles.grid}>
          <Info label="Freelancer" value={contract.freelancerName} />
          <Info label="Monto" value={formatBudget(contract.amount)} />
          <Info label="Inicio" value={formatDate(contract.startedAt)} />
          <Info label="Entrega" value={contract.deliveredAt ? formatDate(contract.deliveredAt) : 'Pendiente'} />
        </View>

        <View style={styles.paymentBox}>
          <StatusBadge status={PAYMENT_STATUS[contract.paymentStatus]} fallback={contract.paymentStatus} />
          <Text style={styles.paymentText}>{PAYMENT_TEXT[contract.paymentStatus]}</Text>
        </View>

        {canDeliver && (
          <PrimaryButton title="Marcar como entregado" loading={running === 'deliver'} onPress={handleDeliver} />
        )}
        {canConfirm && (
          <PrimaryButton
            title={biometric.usesDeviceSecurity ? `Liberar pago con ${biometric.label}` : 'Confirmar y liberar pago'}
            loading={running === 'confirm'}
            onPress={handleConfirm}
          />
        )}
        {canCancel && (
          <PrimaryButton
            title="Cancelar contrato"
            variant="danger"
            loading={running === 'cancel'}
            onPress={handleCancel}
          />
        )}
      </View>
    </ScrollView>
  )
}

function Info({ label, value }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 20, fontFamily: fonts.bold, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  info: { width: '50%', marginBottom: 12 },
  infoLabel: { fontSize: 12, color: colors.muted },
  infoValue: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, marginTop: 2 },
  paymentBox: { backgroundColor: colors.background, borderRadius: 10, padding: 12, gap: 6, marginBottom: 8 },
  paymentText: { color: colors.text, fontSize: 13 },
  message: { padding: 12, borderRadius: 10 },
  success: { backgroundColor: colors.accentLight, color: colors.accent },
  error: { backgroundColor: colors.errorLight, color: colors.error },
})