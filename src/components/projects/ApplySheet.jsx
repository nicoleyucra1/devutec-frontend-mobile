import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import BottomSheet from '../BottomSheet'
import PrimaryButton from '../PrimaryButton'
import CopilotCard from './CopilotCard'
import StageSplitPicker from './StageSplitPicker'
import { STANDARD_SPLIT, isStandardSplit } from '../../utils/stageSplit'
import { applicationService } from '../../services/applicationService'
import { pricingService } from '../../services/pricingService'
import { useAsync } from '../../hooks/useAsync'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatRate, splitClientTotal } from '../../utils/commission'
import { hasFeatureDetail, isoInWeeks } from '../../utils/copilot'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'
import { idType } from '../../utils/propShapes'

const MIN = 20
const MAX = 2000
// Contraoferta de plazo: en vez de un calendario, opciones rápidas en semanas desde hoy (null = la fecha del cliente)
const DEADLINE_WEEKS = [null, 1, 2, 3, 4, 6]

// Mismas reglas que ApplicationRequestDTO en el backend
function validate({ message, price }) {
  const errors = {}
  const length = message.trim().length
  if (length < MIN) errors.message = `Cuéntale al cliente un poco más (mínimo ${MIN} caracteres)`
  if (length > MAX) errors.message = `El mensaje no puede pasar de ${MAX} caracteres`
  if (!(Number(price.replace(',', '.')) > 0)) errors.price = 'Ingresa un precio mayor que 0'
  return errors
}

// "Tu propuesta" (mockup): el freelancer postula sin salir del proyecto. El precio empieza en el presupuesto
// del cliente y se puede cambiar. Es el total que paga el cliente: la comisión de DEVUTEC va adentro.
// Arriba va el copiloto (horas, cuánto cobrar, lo que se suele olvidar) y abajo la contraoferta de plazo.
export default function ApplySheet({ project, visible, onClose, onApplied }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [price, setPrice] = useState(project.budget ? String(Number(project.budget).toFixed(2)) : '')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deadlineWeeks, setDeadlineWeeks] = useState(null)
  // Reparto del pago por etapas que propone el estudiante (opcional)
  const [customSplit, setCustomSplit] = useState(false)
  const [stageSplit, setStageSplit] = useState(STANDARD_SPLIT)
  const copilot = useAsync(
    (options) => (visible ? pricingService.estimateProject(project.id, options) : Promise.resolve(null)),
    [project.id, visible],
  )
  const clientFirstName = (project.clientName ?? '').split(' ').slice(0, 2).join(' ')

  const handleSubmit = async () => {
    setSubmitError(null)
    const found = validate({ message, price })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await applicationService.apply({
        projectId: Number(project.id),
        message: message.trim(),
        proposedPrice: Number(price.replace(',', '.')),
        proposedDeadline: deadlineWeeks ? isoInWeeks(deadlineWeeks) : null,
        ...(customSplit && !isStandardSplit(stageSplit) ? { stagePercents: stageSplit } : {}),
      })
      onApplied()
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Lo que recibe el estudiante y las alertas del copiloto (avisos, no bloquean)
  const split = splitClientTotal(Number(price.replace(',', '.')) || 0)
  const info = copilot.data?.estimate
  const detailed = hasFeatureDetail(info)
  // Sin funcionalidades, las horas no son reales; si el precio también salió de ellas, no hay con qué comparar
  const priceReliable = info && (detailed || info.source !== 'HOURS')
  const underestimate =
    priceReliable && split.freelancerAmount > 0 && split.freelancerAmount < Number(copilot.data.underestimateBelow)
  const averageHours = info ? Math.round((info.hoursMin + info.hoursMax) / 2) : 0
  const perHour = averageHours > 0 ? Math.round(split.freelancerAmount / averageHours) : 0
  const shortDeadline = detailed && deadlineWeeks !== null && deadlineWeeks < info.weeksMin

  return (
    <BottomSheet visible={visible} onClose={onClose} busy={submitting}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>Tu propuesta</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {[project.title, project.clientName].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Pressable onPress={onClose} disabled={submitting} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <CopilotCard estimate={copilot.data} loading={copilot.loading} />

      <Text style={styles.label}>PRECIO TOTAL PARA EL CLIENTE</Text>
      <View style={[styles.priceRow, errors.price && styles.priceRowError]}>
        <Text style={styles.currency}>S/</Text>
        <TextInput
          value={price}
          onChangeText={(text) => {
            setPrice(text)
            setErrors((prev) => ({ ...prev, price: undefined }))
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.muted}
          style={styles.priceInput}
          accessibilityLabel="Precio total para el cliente, en soles"
        />
      </View>
      {errors.price ? <Text style={styles.fieldError}>{errors.price}</Text> : null}
      <Text style={styles.hint}>
        {split.freelancerAmount > 0 ? (
          <>
            Tú recibes <Text style={styles.hintStrong}>{formatBudget(split.freelancerAmount)}</Text>; el {formatRate(split.rate)} es
            la tarifa de DEVUTEC.{' '}
          </>
        ) : null}
        Presupuesto del cliente: {formatBudget(project.budget)}
      </Text>
      {underestimate ? (
        <Text style={styles.alert}>
          <Text style={styles.noteStrong}>Ojo: </Text>
          {detailed
            ? `proyectos así toman entre ${info.hoursMin} y ${info.hoursMax} horas. Con ${formatBudget(Number(price.replace(',', '.')))} estarías cobrando unos S/ ${perHour} la hora. `
            : 'proyectos parecidos terminados en DEVUTEC se cobraron más. '}
          Un precio más realista empieza en {formatBudget(info.clientMin)}.
        </Text>
      ) : null}

      <Text style={styles.label}>¿PARA CUÁNDO LO ENTREGAS?</Text>
      <View style={styles.chips}>
        {DEADLINE_WEEKS.map((weeks) => {
          const selected = deadlineWeeks === weeks
          return (
            <Pressable
              key={String(weeks)}
              onPress={() => setDeadlineWeeks(weeks)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {weeks === null ? 'La del cliente' : `En ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <Text style={styles.hint}>
        {deadlineWeeks === null
          ? `El cliente lo necesita para el ${formatDate(project.deadline)}.`
          : `Propones entregar el ${formatDate(isoInWeeks(deadlineWeeks))} (el cliente lo pidió para el ${formatDate(project.deadline)}).`}
      </Text>
      {shortDeadline ? (
        <Text style={styles.alert}>
          <Text style={styles.noteStrong}>Ojo: </Text>
          proyectos así suelen tomar {info.weeksMin} {info.weeksMin === 1 ? 'semana' : 'semanas'} o más. Asegúrate de que
          te alcance el tiempo.
        </Text>
      ) : null}

      <Text style={styles.messageLabel}>Mensaje para {clientFirstName || 'el cliente'}</Text>
      <TextInput
        value={message}
        onChangeText={(text) => {
          setMessage(text)
          setErrors((prev) => ({ ...prev, message: undefined }))
        }}
        multiline
        textAlignVertical="top"
        maxLength={MAX}
        placeholder="Cuéntale cómo harías el proyecto y por qué eres buena opción"
        placeholderTextColor={colors.muted}
        style={[styles.textarea, errors.message && styles.textareaError]}
      />
      <Text style={[styles.hint, errors.message && styles.fieldErrorText]}>
        {errors.message ?? `${message.trim().length}/${MAX} · mínimo ${MIN}`}
      </Text>

      <Pressable
        onPress={() => setCustomSplit((current) => !current)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: customSplit }}
        style={styles.splitToggle}
      >
        <Ionicons name={customSplit ? 'checkbox' : 'square-outline'} size={20} color={customSplit ? colors.text : colors.muted} />
        <Text style={styles.splitToggleText}>Proponer cómo se libera el pago por etapas</Text>
      </Pressable>
      {customSplit ? (
        <StageSplitPicker value={stageSplit} onChange={setStageSplit} />
      ) : (
        <Text style={styles.hint}>Si no lo cambias: Descubrimiento 10 %, Diseño 30 %, Desarrollo 40 % y Entrega final 10 %.</Text>
      )}

      <View style={styles.note}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
        <Text style={styles.noteText}>
          <Text style={styles.noteStrong}>Pago protegido.</Text> Si te eligen, el monto se retiene antes de que empieces.
        </Text>
      </View>

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      <PrimaryButton title="Enviar postulación" loading={submitting} onPress={handleSubmit} style={styles.button} />
    </BottomSheet>
  )
}

ApplySheet.propTypes = {
  project: PropTypes.shape({
    id: idType.isRequired,
    title: PropTypes.string,
    clientName: PropTypes.string,
    budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    deadline: PropTypes.string,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApplied: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts, radius }) => ({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headText: { flex: 1 },
  title: { fontFamily: fonts.medium, fontSize: 24, letterSpacing: -0.8, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 4 },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.muted, marginTop: 26 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
    marginTop: 10,
    paddingBottom: 4,
  },
  priceRowError: { borderBottomColor: colors.error },
  currency: { fontFamily: fonts.bold, fontSize: 26, color: colors.text },
  priceInput: { flex: 1, fontFamily: fonts.bold, fontSize: 40, letterSpacing: -1.6, color: colors.text, padding: 0 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 8 },
  hintStrong: { fontFamily: fonts.bold, color: colors.text },
  alert: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.pending,
    backgroundColor: colors.pendingLight,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  chipTextSelected: { color: colors.background },
  fieldError: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, marginTop: 6 },
  fieldErrorText: { color: colors.error },
  messageLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: 20, marginBottom: 8 },
  textarea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textareaError: { borderColor: colors.error },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
  },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.accent },
  noteStrong: { fontFamily: fonts.bold },
  splitToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  splitToggleText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  submitError: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8, marginTop: 12 },
  button: { marginTop: 16 },
})
