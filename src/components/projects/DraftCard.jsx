import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import PropTypes from 'prop-types'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, formatDate } from '../../utils/format'
import { formatRate, splitClientTotal, splitInstallments } from '../../utils/commission'

const SOURCE_LABELS = {
  SIMILAR_PROJECTS: 'Proyectos parecidos',
  CATEGORY: 'Proyectos terminados en DEVUTEC',
  HOURS: 'Estimación por horas',
}

// El total del rango sugerido se redondea a decenas para proponerlo como presupuesto inicial
const suggestedTotal = (estimate) => Math.round((Number(estimate.clientMin) + Number(estimate.clientMax)) / 20) * 10

// Tarjeta con el proyecto que armó el asistente (igual que DraftSummary de la web): precio sugerido y de dónde sale,
// presupuesto con la comisión adentro, el pago en dos partes con la bolsa de emergencia y las etapas.
// Las habilidades NO se muestran: las ven los estudiantes.
export default function DraftCard({ draft, onContinue, onKeepChatting }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const { estimate } = draft
  const rate = Number(draft.commissionRate ?? 0.1)
  const [total, setTotal] = useState(() => String(draft.budget?.clientTotal ?? suggestedTotal(estimate)))
  const [showHow, setShowHow] = useState(false)
  const split = splitClientTotal(total.replace(',', '.'), rate)
  const valid = split.clientTotal >= 50
  // Los textos (cuándo se paga y qué cubre) vienen del backend; los montos se recalculan con el presupuesto escrito
  const payments = splitInstallments(split, draft.payments?.length === 2 ? draft.payments : undefined)
  const weeks = estimate.weeksMin === estimate.weeksMax ? estimate.weeksMin : `${estimate.weeksMin} a ${estimate.weeksMax}`

  return (
    <View style={styles.card}>
      <View style={styles.section}>
        <Text style={[styles.kicker, styles.kickerAccent]}>TU PROYECTO</Text>
        <Text style={styles.title}>{draft.title}</Text>
        <Text style={styles.body}>{draft.description}</Text>
        <Text style={styles.small}>
          Entrega sugerida: <Text style={styles.strong}>{formatDate(draft.deadline)}</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.kicker}>PRECIO SUGERIDO</Text>
        <Text style={styles.price}>
          {formatBudget(estimate.clientMin)} – {formatBudget(estimate.clientMax)}
        </Text>
        <Text style={styles.small}>Total con la tarifa de DEVUTEC · {weeks} semanas</Text>
        {estimate.explanation ? <Text style={[styles.body, styles.mt8]}>{estimate.explanation}</Text> : null}
        <Pressable onPress={() => setShowHow((value) => !value)} accessibilityRole="button" accessibilityState={{ expanded: showHow }}>
          <Text style={styles.link}>¿Cómo calculamos esto?</Text>
        </Pressable>
        {showHow ? (
          <View style={styles.how}>
            <Text style={styles.howTitle}>Fuente: {SOURCE_LABELS[estimate.source] ?? estimate.source}</Text>
            {(estimate.features ?? []).map((feature) => (
              <View key={feature.code} style={styles.row}>
                <Text style={styles.howText}>
                  {feature.quantity > 1 ? `${feature.quantity} × ` : ''}
                  {feature.name}
                </Text>
                <Text style={styles.howMuted}>
                  {feature.hoursMin}–{feature.hoursMax} h
                </Text>
              </View>
            ))}
            <Text style={[styles.howText, styles.mt8]}>
              Total {estimate.hoursMin}–{estimate.hoursMax} h × {formatBudget(estimate.hourlyRate)} por hora (tarifa promedio de
              nuestros estudiantes) + {formatRate(rate)} de tarifa DEVUTEC.
            </Text>
          </View>
        ) : null}

        <Text style={[styles.label, styles.mt16]}>¿Cuánto quieres invertir en total?</Text>
        <View style={[styles.inputRow, !valid && styles.inputError]}>
          <Text style={styles.currency}>S/</Text>
          <TextInput
            value={total}
            onChangeText={setTotal}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel="Presupuesto total en soles"
          />
        </View>
        {!valid ? <Text style={styles.error}>El presupuesto mínimo es S/ 50</Text> : null}
        <View style={styles.split}>
          <View style={styles.row}>
            <Text style={styles.body}>Para el estudiante</Text>
            <Text style={styles.strong}>{formatBudget(split.freelancerAmount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Tarifa DEVUTEC ({formatRate(rate)})</Text>
            <Text style={styles.muted}>{formatBudget(split.commission)}</Text>
          </View>
          <View style={[styles.row, styles.splitTotal]}>
            <Text style={styles.accentStrong}>Pagas en total</Text>
            <Text style={styles.accentStrong}>{formatBudget(split.clientTotal)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.kicker}>PLAN DE PAGOS</Text>
        <Text style={styles.small}>Pagas en dos partes. El dinero queda en garantía y cada etapa se libera recién cuando la apruebas.</Text>
        {payments.map((payment) => (
          <View key={payment.number} style={styles.payment}>
            <View style={styles.row}>
              <Text style={styles.strong}>
                Pago {payment.number} <Text style={styles.muted}>{payment.percent} %</Text>
              </Text>
              <Text style={styles.paymentAmount}>{formatBudget(payment.clientAmount)}</Text>
            </View>
            <Text style={styles.small}>{payment.dueAt}</Text>
            <View style={styles.chips}>
              {(payment.covers ?? []).map((item) => (
                <Text key={item} style={[styles.chip, item.startsWith('Bolsa') && styles.chipFund]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        ))}
        <Text style={styles.fund}>
          <Text style={styles.fundStrong}>Bolsa de emergencia: </Text>
          es un 10 % aparte de las etapas que se paga al inicio. Si el proyecto se detiene, con ella se le paga al estudiante lo que
          ya entregó; si todo va bien, se le libera al terminar el proyecto.
        </Text>
        <Text style={[styles.kicker, styles.mt16]}>ETAPAS DEL TRABAJO</Text>
        <View style={styles.chips}>
          {(draft.stages ?? []).map((stage) => (
            <Text key={stage.name} style={styles.stage}>
              {stage.name} <Text style={styles.muted}>{stage.percent} %</Text>
            </Text>
          ))}
          <Text style={[styles.stage, styles.chipFund]}>Bolsa de emergencia 10 %</Text>
        </View>
      </View>

      <View style={[styles.section, styles.actions]}>
        <Pressable
          onPress={() => onContinue({ ...draft, budgetTotal: split.clientTotal })}
          disabled={!valid}
          accessibilityRole="button"
          accessibilityState={{ disabled: !valid }}
          style={({ pressed }) => [styles.primary, (!valid || pressed) && styles.dim]}
        >
          <Text style={styles.primaryText}>Revisar y publicar</Text>
        </Pressable>
        <Pressable onPress={onKeepChatting} accessibilityRole="button" style={({ pressed }) => [styles.secondary, pressed && styles.dim]}>
          <Text style={[styles.secondaryText, { color: colors.text }]}>Seguir conversando</Text>
        </Pressable>
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: 'hidden' },
  section: { padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 },
  kicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.muted },
  kickerAccent: { color: colors.accent },
  title: { fontFamily: fonts.bold, fontSize: 21, letterSpacing: -0.4, color: colors.text, marginTop: 2 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 4 },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  strong: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  accentStrong: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
  price: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.5, color: colors.text, marginTop: 2 },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accent, textDecorationLine: 'underline', marginTop: 8 },
  how: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginTop: 8, gap: 4 },
  howTitle: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginBottom: 4 },
  howText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.text, flexShrink: 1 },
  howMuted: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  inputError: { borderColor: colors.error },
  currency: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  input: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.text, paddingHorizontal: 12, paddingVertical: 10 },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.error, marginTop: 4 },
  split: { backgroundColor: colors.accentLight, borderRadius: 12, padding: 12, gap: 4, marginTop: 8 },
  splitTotal: { borderTopWidth: 1, borderTopColor: colors.accent + '33', paddingTop: 6, marginTop: 2 },
  payment: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginTop: 8 },
  paymentAmount: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  chipFund: { backgroundColor: colors.pendingLight, color: colors.pending },
  stage: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  fund: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.pending,
    backgroundColor: colors.pendingLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  fundStrong: { fontFamily: fonts.semibold },
  actions: { gap: 8, borderBottomWidth: 0 },
  primary: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 15 },
  primaryText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.onPrimary },
  secondary: { alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 14 },
  secondaryText: { fontFamily: fonts.semibold, fontSize: 15 },
  dim: { opacity: 0.6 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
})

DraftCard.propTypes = {
  draft: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    deadline: PropTypes.string,
    commissionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    budget: PropTypes.shape({ clientTotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }),
    estimate: PropTypes.shape({
      source: PropTypes.string,
      explanation: PropTypes.string,
      hoursMin: PropTypes.number,
      hoursMax: PropTypes.number,
      hourlyRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      clientMin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      clientMax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      weeksMin: PropTypes.number,
      weeksMax: PropTypes.number,
      features: PropTypes.arrayOf(
        PropTypes.shape({
          code: PropTypes.string.isRequired,
          name: PropTypes.string,
          quantity: PropTypes.number,
          hoursMin: PropTypes.number,
          hoursMax: PropTypes.number,
        }),
      ),
    }).isRequired,
    stages: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired, percent: PropTypes.number.isRequired })),
    payments: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.number.isRequired,
        percent: PropTypes.number.isRequired,
        dueAt: PropTypes.string,
        covers: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
  }).isRequired,
  onContinue: PropTypes.func.isRequired,
  onKeepChatting: PropTypes.func.isRequired,
}
