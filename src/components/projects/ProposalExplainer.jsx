import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { applicationService } from '../../services/applicationService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { translationError } from '../contracts/translationError'
import { idType } from '../../utils/propShapes'

// Contraoferta explicada por la IA: el cliente pide a Cuyi que le explique en simple qué cambia y por qué.
// Se pide solo al tocar el botón (para no gastar IA en propuestas que no mira); la respuesta queda guardada.
export default function ProposalExplainer({ applicationId, freelancerName }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [state, setState] = useState({ open: false, loading: false, data: null, error: null })
  const firstName = freelancerName?.split(' ')[0] ?? 'el estudiante'

  const load = () => {
    setState({ open: true, loading: true, data: null, error: null })
    applicationService
      .explain(applicationId)
      .then((data) => setState({ open: true, loading: false, data, error: null }))
      .catch((err) => setState({ open: true, loading: false, data: null, error: translationError(err) }))
  }

  if (!state.open) {
    return (
      <Pressable
        onPress={load}
        accessibilityRole="button"
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.triggerText}>✨ ¿Qué cambia? Cuyi te explica</Text>
      </Pressable>
    )
  }

  const data = state.data

  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim={state.loading ? 'escribe' : state.error ? 'confundido' : 'saluda'} size={24} />
        </View>
        <Text style={styles.kicker}>CUYI TE LO EXPLICA</Text>
      </View>

      {state.loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.muted}>Cuyi está leyendo la propuesta de {firstName}...</Text>
        </View>
      ) : null}

      {state.error ? (
        <View style={styles.section}>
          <Text style={styles.muted}>{state.error}</Text>
          <PrimaryButton title="Intentar de nuevo" variant="secondary" onPress={load} />
        </View>
      ) : null}

      {data ? (
        <>
          <Text style={styles.summary}>{data.summary}</Text>
          {data.reason ? (
            <View style={styles.section}>
              <Text style={styles.label}>POR QUÉ</Text>
              <Text style={styles.item}>{data.reason}</Text>
            </View>
          ) : null}
          {data.forYou?.length ? (
            <View style={styles.section}>
              <Text style={styles.label}>QUÉ SIGNIFICA PARA TI</Text>
              {data.forYou.map((item) => (
                <Text key={item} style={styles.item}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
          {data.questions?.length ? (
            <View style={styles.section}>
              <Text style={styles.label}>PUEDES PREGUNTARLE</Text>
              {data.questions.map((item) => (
                <Text key={item} style={styles.item}>
                  💬 {item}
                </Text>
              ))}
            </View>
          ) : null}
          <Text style={styles.note}>Es una ayuda para decidir: la decisión de aceptar o no es tuya.</Text>
        </>
      ) : null}
    </View>
  )
}

ProposalExplainer.propTypes = {
  applicationId: idType.isRequired,
  freelancerName: PropTypes.string,
}

const createStyles = ({ colors, fonts }) => ({
  trigger: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lime,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 12,
  },
  triggerText: { fontFamily: fonts.semibold, fontSize: 13, color: '#1A1A18' },
  box: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginTop: 12, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summary: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.text },
  section: { gap: 4 },
  label: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  item: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
})
