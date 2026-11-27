import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { contractService } from '../../services/contractService'
import { errorMessage } from '../../utils/errorMessage'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'

// Los mensajes propios del backend (Cuyi no pudo responder, etapa cancelada...) se muestran tal cual
function guideError(err) {
  const apiMessage = err?.response?.data?.message
  if (apiMessage && [409, 502, 503].includes(err?.response?.status)) return apiMessage
  return errorMessage(err)
}

// Mini guía de la etapa en curso, para el estudiante: qué hacer (checklist con horas), qué preguntarle al
// cliente, riesgos, un consejo, el avance vs. las horas y si lo que cobra está bien para esas horas.
export default function StageGuideCard({ contractId, stage, clientName }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [state, setState] = useState({ loading: true, guide: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(null)
  const client = clientName?.split(' ')[0] ?? 'el cliente'

  useEffect(() => {
    let active = true
    contractService
      .getStageGuide(contractId, stage.id)
      .then((guide) => active && setState({ loading: false, guide, error: null }))
      .catch((err) => active && setState({ loading: false, guide: null, error: guideError(err) }))
    return () => {
      active = false
    }
  }, [contractId, stage.id, attempt])

  const retry = () => {
    setState({ loading: true, guide: null, error: null })
    setAttempt((n) => n + 1)
  }

  const toggleTask = async (task) => {
    setSaving(task.id)
    try {
      const guide = await contractService.updateGuideTask(contractId, stage.id, task.id, !task.done)
      setState((prev) => ({ ...prev, guide }))
    } catch (err) {
      setState((prev) => ({ ...prev, error: guideError(err) }))
    } finally {
      setSaving(null)
    }
  }

  const { guide } = state
  const progress = guide?.progress
  const behind = progress?.schedule === 'BEHIND'

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim={state.loading ? 'escribe' : 'saluda'} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>MINI GUÍA DE LA ETAPA</Text>
          <Text style={styles.title}>{stage.name}</Text>
        </View>
      </View>

      {state.loading && (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.muted}>Cuyi está armando tu plan para esta etapa...</Text>
        </View>
      )}

      {state.error && (
        <View style={styles.box}>
          <Text style={styles.muted}>{state.error}</Text>
          {!guide && <PrimaryButton title="Intentar de nuevo" variant="secondary" onPress={retry} />}
        </View>
      )}

      {guide && (
        <>
          <View style={[styles.pill, behind ? styles.pillBehind : styles.pillOk]}>
            <Text style={[styles.pillText, { color: behind ? colors.pending : colors.accent }]}>{progress.label}</Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${progress.percent}%` }]} />
          </View>
          <Text style={styles.small}>
            {progress.hoursDone} de {progress.hoursTotal} horas
            {progress.expectedPercent != null ? ` · a hoy deberías llevar ${progress.expectedPercent} %` : ''}
          </Text>

          <Text style={styles.section}>Qué hacer</Text>
          {guide.tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => toggleTask(task)}
              disabled={saving === task.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.done, busy: saving === task.id }}
              style={({ pressed }) => [styles.task, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name={task.done ? 'checkbox' : 'square-outline'} size={22} color={task.done ? colors.accent : colors.muted} />
              <Text style={[styles.taskText, task.done && styles.taskDone]}>{task.title}</Text>
              <Text style={styles.small}>{task.hours} h</Text>
            </Pressable>
          ))}

          {guide.clientQuestions.length > 0 && (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Pregúntale a {client}</Text>
              {guide.clientQuestions.map((question) => (
                <Text key={question} style={styles.item}>
                  «{question}»
                </Text>
              ))}
            </View>
          )}
          {guide.risks.length > 0 && (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Ojo con esto</Text>
              {guide.risks.map((risk) => (
                <Text key={risk} style={styles.item}>
                  • {risk}
                </Text>
              ))}
            </View>
          )}
          {guide.tip ? (
            <View style={[styles.box, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.item, { color: colors.accent }]}>
                <Text style={styles.bold}>Consejo: </Text>
                {guide.tip}
              </Text>
            </View>
          ) : null}
          {guide.priceCheck ? (
            <View style={[styles.box, guide.priceCheck.low && { backgroundColor: colors.pendingLight }]}>
              <Text style={[styles.item, { color: guide.priceCheck.low ? colors.pending : colors.muted }]}>
                {guide.priceCheck.message}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  )
}

StageGuideCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  clientName: PropTypes.string,
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  title: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text, marginTop: 4 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 14 },
  pillOk: { backgroundColor: colors.accentLight },
  pillBehind: { backgroundColor: colors.pendingLight },
  pillText: { fontFamily: fonts.semibold, fontSize: 12 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.primaryLight, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  section: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginTop: 16, marginBottom: 4 },
  task: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  taskText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  box: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginTop: 10, gap: 6 },
  boxTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  item: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  bold: { fontFamily: fonts.semibold },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
})
