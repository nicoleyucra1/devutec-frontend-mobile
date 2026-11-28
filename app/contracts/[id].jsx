import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, AppState, Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import * as ExpoLinking from 'expo-linking'
import { Ionicons } from '@expo/vector-icons'
import Money from '../../src/components/Money'
import PrimaryButton from '../../src/components/PrimaryButton'
import DeliverSheet from '../../src/components/contracts/DeliverSheet'
import ReleaseSheet from '../../src/components/contracts/ReleaseSheet'
import StageGuideCard from '../../src/components/contracts/StageGuideCard'
import QualityCard from '../../src/components/contracts/QualityCard'
import CoordinateCard from '../../src/components/contracts/CoordinateCard'
import TranslationCard from '../../src/components/contracts/TranslationCard'
import ClientRequestTranslator from '../../src/components/contracts/ClientRequestTranslator'
import ScreenState from '../../src/components/ScreenState'
import StatusBadge from '../../src/components/StatusBadge'
import InstallmentsCard from '../../src/components/contracts/InstallmentsCard'
import ClosedForNonPaymentCard from '../../src/components/contracts/ClosedForNonPaymentCard'
import { closedForNonPayment } from '../../src/utils/installments'
import { useAuth } from '../../src/hooks/useAuth'
import { useBiometricAuth } from '../../src/hooks/useBiometricAuth'
import { useContract } from '../../src/hooks/useContracts'
import { contractService } from '../../src/services/contractService'
import { confirmAlert } from '../../src/utils/confirmAlert'
import { preferenceStorage } from '../../src/utils/preferenceStorage'
import { errorMessage } from '../../src/utils/errorMessage'
import { contractCode, formatDate, formatBudget } from '../../src/utils/format'
import { CONTRACT_STATUS, PAYMENT_STATUS } from '../../src/utils/status'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { useHeaderOffset } from '../../src/hooks/useHeaderOffset'
import PropTypes from 'prop-types'

const PAYMENT_TEXT = {
  HELD: 'DEVUTEC guarda el pago hasta que el cliente confirme la entrega.',
  RELEASED: 'El pago ya fue entregado al freelancer.',
  REFUNDED: 'El pago fue devuelto al cliente.',
}

export default function ContractDetailScreen() {
  const styles = useThemedStyles(createStyles)
  const headerOffset = useHeaderOffset()
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const biometric = useBiometricAuth()
  const { data: contract, loading, error, reload } = useContract(id)

  // Acción en curso ('pay', 'confirm' o 'cancel'); su botón muestra que está cargando
  const [running, setRunning] = useState(null)
  const [message, setMessage] = useState(null)
  const [releasing, setReleasing] = useState(false)
  // Panel para pegar el link de la entrega
  const [delivering, setDelivering] = useState(false)

  // Pago con tarjeta: la página de Stripe se abre en el navegador. La sesión de pago se guarda en el celular
  // (por si el sistema cierra la app mientras se paga) y al volver se le pregunta al backend si ya se pagó.
  const pendingSession = useRef(null)
  const [awaitingPayment, setAwaitingPayment] = useState(false)
  const storageKey = `devutec.checkout.${id}`

  const rememberSession = (sessionId) => {
    pendingSession.current = sessionId
    setAwaitingPayment(Boolean(sessionId))
    preferenceStorage.set(storageKey, sessionId ?? '')
  }

  // quiet: al abrir la pantalla no se muestra el aviso de "todavía no vemos el pago", solo si se pagó
  const verifyPayment = async ({ quiet = false } = {}) => {
    const sessionId = pendingSession.current
    if (!sessionId) return
    setRunning('pay')
    if (!quiet) setMessage(null)
    try {
      await contractService.confirmCheckout(id, sessionId)
      rememberSession(null)
      setMessage({ ok: true, text: 'Pago recibido. El dinero queda en garantía y se libera cuando apruebas cada etapa.' })
      reload()
    } catch (err) {
      // 409: Stripe todavía no marca la sesión como pagada (se cerró la página o aún se está procesando)
      if (!quiet) {
        setMessage({
          ok: false,
          text:
            err.response?.status === 409
              ? 'Todavía no vemos el pago. Si cancelaste, no se hizo ningún cobro. Si ya pagaste, toca "Ya pagué, verificar" en unos segundos.'
              : errorMessage(err),
        })
      }
    } finally {
      setRunning(null)
    }
  }

  // Se guarda la última versión de verifyPayment para usarla desde el listener sin volver a registrarlo
  const verifyRef = useRef(verifyPayment)
  verifyRef.current = verifyPayment

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && pendingSession.current) verifyRef.current()
    })
    return () => subscription.remove()
  }, [])

  // Al abrir el contrato: si quedó un pago pendiente guardado (por ejemplo, la app se reinició), se revisa
  useEffect(() => {
    let active = true
    preferenceStorage.get(storageKey).then((sessionId) => {
      if (!active || !sessionId) return
      pendingSession.current = sessionId
      setAwaitingPayment(true)
      verifyRef.current({ quiet: true })
    })
    return () => {
      active = false
    }
  }, [storageKey])

  // installment: con el pago en dos partes, el número de pago (1 o 2); sin él se paga el contrato completo
  const handlePay = async (installment) => {
    setRunning('pay')
    setMessage(null)
    try {
      // Link para que, al terminar en Stripe, la página puente de la web vuelva a abrir este contrato en la app.
      // En el APK queda devutec://contracts/ID y en Expo Go exp://.../--/contracts/ID
      const appReturnUrl = ExpoLinking.createURL(`/contracts/${id}`)
      const { sessionId, checkoutUrl } = await contractService.startCheckout(id, appReturnUrl, installment)
      rememberSession(sessionId)
      await Linking.openURL(checkoutUrl)
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setRunning(null)
    }
  }

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

  // Después de entregar desde el panel: aviso arriba y se recarga el contrato
  const handleDelivered = () => {
    setDelivering(false)
    setMessage({ ok: true, text: 'Trabajo entregado. El cliente revisará tu link y confirmará la entrega.' })
    reload()
  }

  // Liberar el pago es la acción más delicada: el panel "Liberar pago" pide huella, Face ID, el código
  // del celular o la contraseña, y recién ahí se llama al backend
  const handleRelease = () => {
    setReleasing(false)
    run('confirm', contractService.confirm, 'Entrega confirmada. El pago fue liberado al freelancer.')
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
  // Con etapas: la entrega y el pedido de cambios de la etapa en curso se traducen con su nombre como contexto
  const translatedStage = contract.stages?.find((stage) => stage.position === contract.currentStage)
  const deliveryNote = translatedStage?.deliveryNote || contract.deliveryNote
  const deliveryStageName = translatedStage?.deliveryNote ? translatedStage.name : undefined
  const changeRequest = translatedStage?.status === 'CHANGES_REQUESTED' ? translatedStage.changeRequestNote : null
  // Pago en dos partes: la etapa en curso solo se puede entregar si ya se pagó la parte que la cubre
  // (el backend también lo revisa). Sin plan (contratos antiguos) no cambia nada
  const plan = contract.installments ?? []
  const stageNow = contract.stages?.find((stage) => stage.position === contract.currentStage)
  const coveringInstallment = stageNow && plan.length > 0 ? plan[Math.min(stageNow.paymentPart ?? 1, plan.length) - 1] : null
  const stagePaid = !coveringInstallment || coveringInstallment.status !== 'PENDING'
  const canDeliver = isFreelancer && contract.status === 'IN_PROGRESS' && stagePaid
  const canCancel = isClient && contract.status === 'IN_PROGRESS'
  // Etapa en la que se está trabajando (la manda el backend con las etapas); la Mini guía es para el estudiante
  const currentStage = contract.stages?.find((stage) => stage.position === contract.currentStage)
  const showGuide =
    isFreelancer &&
    (contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') &&
    currentStage &&
    currentStage.status !== 'CANCELLED'
  const canConfirm = isClient && contract.status === 'DELIVERED'
  // Pago en dos partes: los botones de pagar viven en la tarjeta de pagos. Sin plan (contratos antiguos)
  // se mantiene el pago único de siempre
  const hasPlan = (contract.installments?.length ?? 0) > 0
  // El cliente puede pagar con tarjeta mientras el contrato siga abierto y no lo haya pagado antes
  const canPay =
    !hasPlan &&
    isClient &&
    (contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') &&
    contract.paymentStatus === 'HELD' &&
    !contract.paidWithCard

  // Sube el contenido cuando aparece el teclado
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={headerOffset}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} />}
      >
        {message && <Text style={[styles.message, message.ok ? styles.success : styles.error]}>{message.text}</Text>}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.code}>{contractCode(contract.id)}</Text>
            <View style={styles.badges}>
              <StatusBadge
                status={closedForNonPayment(contract) ? { label: 'Cerrado: sin pago 2', tone: 'pending' } : CONTRACT_STATUS[contract.status]}
                fallback={contract.status}
              />
              <StatusBadge status={PAYMENT_STATUS[contract.paymentStatus]} fallback={contract.paymentStatus} />
            </View>
          </View>
          <Money value={contract.amount} style={styles.amount} centsStyle={styles.cents} />
          <Text style={styles.title}>{contract.projectTitle}</Text>

          <View style={styles.grid}>
            <Info label="Freelancer" value={contract.freelancerName} />
            <Info label="Inicio" value={formatDate(contract.startedAt)} />
            <Info label="Entrega" value={contract.deliveredAt ? formatDate(contract.deliveredAt) : 'Pendiente'} />
          </View>

          <View style={styles.paymentBox}>
            <Text style={styles.paymentText}>{PAYMENT_TEXT[contract.paymentStatus]}</Text>
            {contract.paidWithCard && <Text style={styles.paidText}>Pagado con tarjeta ✓</Text>}
          </View>

          {canPay && (
            <View style={styles.payBox}>
              <PrimaryButton title="Pagar con tarjeta" loading={running === 'pay' && !awaitingPayment} onPress={() => handlePay()} />
              {awaitingPayment && (
                <PrimaryButton
                  title="Ya pagué, verificar"
                  variant="secondary"
                  loading={running === 'pay'}
                  onPress={() => verifyPayment()}
                />
              )}
              <Text style={styles.payHint}>Modo de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC</Text>
            </View>
          )}

          {canDeliver && <PrimaryButton title="Entregar trabajo" onPress={() => setDelivering(true)} />}
          {canConfirm && (
            <PrimaryButton
              title={`Liberar ${formatBudget(contract.amount)}`}
              loading={running === 'confirm'}
              onPress={() => setReleasing(true)}
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

        {isClient || isFreelancer ? <ClosedForNonPaymentCard contract={contract} isClient={isClient} /> : null}

        {hasPlan && (isClient || isFreelancer) ? (
          <InstallmentsCard
            contract={contract}
            isClient={isClient}
            onPay={handlePay}
            paying={running === 'pay'}
            awaitingPayment={awaitingPayment}
            onVerify={() => verifyPayment()}
          />
        ) : null}

        {contract.deliveryUrl ? <DeliveryCard contract={contract} isClient={isClient} /> : null}

        {/* IA traductora: explica la nota de entrega al cliente (el estudiante ve cómo le llegará) */}
        {deliveryNote && (isClient || isFreelancer) ? (
          <TranslationCard
            key={deliveryNote}
            contractId={contract.id}
            note={deliveryNote}
            stageName={deliveryStageName}
            freelancerName={contract.freelancerName}
            clientName={contract.clientName}
            isClient={isClient}
          />
        ) : null}

        {/* IA traductora al revés: el pedido de cambios del cliente se traduce solo para el estudiante;
            si no hay pedido, el estudiante puede pegar cualquier mensaje del cliente */}
        {isFreelancer && (contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') ? (
          <ClientRequestTranslator
            key={changeRequest ?? 'manual'}
            contractId={contract.id}
            clientName={contract.clientName}
            stageName={translatedStage?.name}
            request={changeRequest ?? undefined}
          />
        ) : null}

        {(isClient || isFreelancer) && <CoordinateCard contract={contract} isClient={isClient} />}

        {showGuide ? (
          <StageGuideCard key={currentStage.id} contractId={contract.id} stage={currentStage} clientName={contract.clientName} />
        ) : null}

        {/* Entrega final de una web: tiene que pasar el estándar de calidad de DEVUTEC (la tarjeta decide si aplica) */}
        {currentStage && (isClient || isFreelancer) && (contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') ? (
          <QualityCard
            key={`quality-${currentStage.id}`}
            contractId={contract.id}
            stage={currentStage}
            isClient={isClient}
            freelancerName={contract.freelancerName}
          />
        ) : null}

        {canDeliver && (
          <DeliverSheet
            contract={contract}
            visible={delivering}
            onClose={() => setDelivering(false)}
            onDelivered={handleDelivered}
          />
        )}

        {canConfirm && (
          <ReleaseSheet
            contract={contract}
            email={user?.email}
            biometric={biometric}
            visible={releasing}
            onClose={() => setReleasing(false)}
            onRelease={handleRelease}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Lo que entregó el freelancer: el link (abre la app o el navegador) y su nota
function DeliveryCard({ contract, isClient }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const firstName = contract.freelancerName?.split(' ')[0] ?? 'El freelancer'
  return (
    <View style={styles.card}>
      <Text style={styles.deliveryKicker}>ENTREGA</Text>
      <Text style={styles.deliveryTitle}>
        {isClient && contract.status === 'DELIVERED' ? `Revisa lo que entregó ${firstName}` : 'Trabajo entregado'}
      </Text>
      <Pressable
        onPress={() => Linking.openURL(contract.deliveryUrl).catch(() => {})}
        accessibilityRole="link"
        accessibilityLabel="Abrir el trabajo entregado"
        style={({ pressed }) => [styles.deliveryLink, pressed && styles.pressed]}
      >
        <Ionicons name="link-outline" size={18} color={colors.text} />
        <Text style={styles.deliveryUrl} numberOfLines={1}>
          {contract.deliveryUrl.replace(/^https?:\/\//, '')}
        </Text>
        <Text style={styles.deliveryOpen}>Abrir</Text>
      </Pressable>
      {/* El cliente ve la nota traducida por Cuyi más abajo; el original queda en «Ver mensaje original» */}
      {contract.deliveryNote && !isClient ? (
        <View style={styles.deliveryNote}>
          <Text style={styles.deliveryNoteLabel}>NOTA DE {firstName.toUpperCase()}</Text>
          <Text style={styles.deliveryNoteText}>{contract.deliveryNote}</Text>
        </View>
      ) : null}
    </View>
  )
}

DeliveryCard.propTypes = {
  contract: PropTypes.shape({
    status: PropTypes.string,
    freelancerName: PropTypes.string,
    deliveryUrl: PropTypes.string.isRequired,
    deliveryNote: PropTypes.string,
  }).isRequired,
  isClient: PropTypes.bool,
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
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  code: { fontSize: 13, fontFamily: fonts.regular, color: colors.muted, letterSpacing: 0.5, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, flexShrink: 1 },
  amount: { fontFamily: fonts.bold, fontSize: 44, letterSpacing: -2.2, color: colors.text, marginTop: 14 },
  cents: { color: colors.muted },
  title: { fontSize: 18, fontFamily: fonts.semibold, color: colors.text, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  info: { width: '50%', marginBottom: 12 },
  infoLabel: { fontSize: 12, color: colors.muted },
  infoValue: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, marginTop: 2 },
  paymentBox: { backgroundColor: colors.background, borderRadius: 10, padding: 12, gap: 6, marginBottom: 8 },
  paymentText: { color: colors.text, fontSize: 13 },
  paidText: { color: colors.accent, fontSize: 13, fontFamily: fonts.semibold },
  payBox: { gap: 8, marginBottom: 8 },
  payHint: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  pressed: { opacity: 0.7 },
  deliveryKicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  deliveryTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text, marginTop: 6 },
  deliveryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  deliveryUrl: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  deliveryOpen: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
  deliveryNote: { backgroundColor: colors.background, borderRadius: 12, padding: 14, marginTop: 10, gap: 4 },
  deliveryNoteLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  deliveryNoteText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.text },
  message: { padding: 12, borderRadius: 10 },
  success: { backgroundColor: colors.accentLight, color: colors.accent },
  error: { backgroundColor: colors.errorLight, color: colors.error },
})

Info.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
}
