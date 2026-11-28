import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { hasFeatureDetail } from '../../utils/copilot'
import { formatBudget } from '../../utils/format'

// Copiloto "Antes de postular": horas que suele tomar el proyecto, cuánto cobrar y lo que se suele olvidar.
// Los números los calcula el backend con la tabla de horas y los proyectos terminados (no usa IA).
export default function CopilotCard({ estimate, loading }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [open, setOpen] = useState(true)

  if (loading) {
    return (
      <View style={[styles.card, styles.loading]}>
        <ActivityIndicator color={colors.muted} />
      </View>
    )
  }
  // Si el copiloto no carga, se puede postular igual: solo no se muestra la ayuda
  if (!estimate) return null

  const { estimate: info, myHourlyRate, myMin, myMax, commonlyForgotten } = estimate
  // Sin funcionalidades no hay horas reales; y si el precio también salió de las horas, tampoco se muestra
  const detailed = hasFeatureDetail(info)
  const showPrice = detailed || info.source !== 'HOURS'
  const weeks = info.weeksMin === info.weeksMax ? `${info.weeksMin}` : `${info.weeksMin} a ${info.weeksMax}`

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <Text style={styles.kicker}>ANTES DE POSTULAR · COPILOTO</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
      </Pressable>

      {open ? (
        <>
          {!detailed ? (
            <Text style={styles.notice}>
              Este proyecto se publicó sin el asistente, así que no tenemos el detalle de sus funcionalidades para
              estimar las horas. Revisa la descripción y calcula cuánto te tomaría.
            </Text>
          ) : null}

          {detailed ? (
            <View style={styles.row}>
              <Text style={styles.label}>Horas que suele tomar</Text>
              <Text style={styles.value}>
                {info.hoursMin} a {info.hoursMax} horas · {weeks} {info.weeksMax === 1 ? 'semana' : 'semanas'}
              </Text>
            </View>
          ) : null}

          {showPrice ? (
            <View style={styles.row}>
              <Text style={styles.label}>Precio sugerido (lo que paga el cliente)</Text>
              <Text style={styles.value}>
                {formatBudget(info.clientMin)} a {formatBudget(info.clientMax)}
              </Text>
              <Text style={styles.muted}>
                Tú recibirías {formatBudget(info.freelancerMin)} a {formatBudget(info.freelancerMax)}.
              </Text>
            </View>
          ) : null}

          {detailed ? (
            <View style={styles.row}>
              <Text style={styles.label}>Con tu tarifa por hora</Text>
              <Text style={styles.text}>
                {myHourlyRate
                  ? `S/ ${Number(myHourlyRate)} × ${info.hoursMin}–${info.hoursMax} h = ${formatBudget(myMin)} a ${formatBudget(myMax)} para ti`
                  : 'Agrega tu tarifa por hora en tu perfil para calcular cuánto cobrarías tú.'}
              </Text>
            </View>
          ) : null}

          {showPrice ? <Text style={styles.muted}>{info.explanation}</Text> : null}

          {detailed && info.stages?.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.subtitle}>Horas por etapa</Text>
              {info.stages.map((stage) => (
                <View key={stage.name} style={styles.stage}>
                  <Text style={styles.text}>
                    {stage.name} <Text style={styles.muted}>{stage.percent} %</Text>
                  </Text>
                  <Text style={styles.muted}>
                    {stage.hoursMin}–{stage.hoursMax} h
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {commonlyForgotten?.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.subtitle}>Lo que se suele olvidar</Text>
              {commonlyForgotten.map((item) => (
                <Text key={item} style={styles.bullet}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  )
}

const money = PropTypes.oneOfType([PropTypes.number, PropTypes.string])

CopilotCard.propTypes = {
  estimate: PropTypes.shape({
    estimate: PropTypes.shape({
      source: PropTypes.string,
      explanation: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })),
      hoursMin: PropTypes.number,
      hoursMax: PropTypes.number,
      weeksMin: PropTypes.number,
      weeksMax: PropTypes.number,
      freelancerMin: money,
      freelancerMax: money,
      clientMin: money,
      clientMax: money,
      stages: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          percent: PropTypes.number,
          hoursMin: PropTypes.number,
          hoursMax: PropTypes.number,
        }),
      ),
    }),
    myHourlyRate: money,
    myMin: money,
    myMax: money,
    underestimateBelow: money,
    commonlyForgotten: PropTypes.arrayOf(PropTypes.string),
  }),
  loading: PropTypes.bool,
}

const createStyles = ({ colors, fonts, radius }) => ({
  card: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 18,
    gap: 10,
  },
  loading: { alignItems: 'center', paddingVertical: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.text },
  notice: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
  },
  row: { gap: 2 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  value: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted },
  block: { gap: 4, marginTop: 4 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 2 },
  stage: { flexDirection: 'row', justifyContent: 'space-between' },
  bullet: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted },
})
