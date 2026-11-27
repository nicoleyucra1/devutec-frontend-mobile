import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { contractService } from '../../services/contractService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { translationError } from './translationError'

const SECTIONS = [
  { key: 'yaEsta', title: '✅ Ya está' },
  { key: 'falta', title: '⏳ Falta' },
  { key: 'revisaEsto', title: '👀 Revisa esto' },
]

// IA traductora para el cliente: explica en simple lo que mandó el estudiante en su entrega.
// El mensaje original siempre se puede ver. El estudiante ve la misma tarjeta como «así lo verá el cliente».
export default function TranslationCard({ contractId, note, freelancerName, clientName, isClient, stageName }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const [showOriginal, setShowOriginal] = useState(false)
  const firstName = freelancerName?.split(' ')[0] ?? 'el estudiante'
  const clientFirst = clientName?.split(' ')[0] ?? 'el cliente'

  useEffect(() => {
    let active = true
    contractService
      .translate(contractId, { direction: 'FOR_CLIENT', text: note, stageName })
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((err) => active && setState({ loading: false, data: null, error: translationError(err) }))
    return () => {
      active = false
    }
  }, [contractId, note, stageName, attempt])

  const retry = () => {
    setState({ loading: true, data: null, error: null })
    setAttempt((n) => n + 1)
  }

  const result = state.data?.result

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim={state.loading ? 'escribe' : state.error ? 'confundido' : 'saluda'} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{isClient ? 'CUYI TE LO EXPLICA' : `ASÍ LO VERÁ ${clientFirst.toUpperCase()}`}</Text>
          <Text style={styles.title}>
            {isClient ? `Lo que te mandó ${firstName}, en simple` : 'Tu entrega, sin palabras técnicas'}
          </Text>
        </View>
      </View>

      {state.loading && (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.muted}>Cuyi está leyendo el mensaje de {firstName}...</Text>
        </View>
      )}

      {state.error && (
        <View style={styles.box}>
          <Text style={styles.muted}>{state.error}</Text>
          <PrimaryButton title="Intentar de nuevo" variant="secondary" onPress={retry} />
        </View>
      )}

      {result && (
        <>
          <Text style={styles.simple}>{result.enSimple}</Text>
          {SECTIONS.filter(({ key }) => result[key]?.length > 0).map(({ key, title }) => (
            <View key={key} style={styles.box}>
              <Text style={styles.boxTitle}>{title}</Text>
              {result[key].map((item) => (
                <Text key={item} style={styles.item}>
                  • {item}
                </Text>
              ))}
            </View>
          ))}
          {result.terminos?.length > 0 && (
            <View style={{ marginTop: 12, gap: 4 }}>
              <Text style={styles.label}>PALABRAS QUE USÓ {firstName.toUpperCase()}</Text>
              {result.terminos.map(({ termino, significado }) => (
                <Text key={termino} style={styles.item}>
                  <Text style={styles.bold}>«{termino}»</Text>
                  <Text style={styles.muted}> = {significado}</Text>
                </Text>
              ))}
            </View>
          )}
        </>
      )}

      {!state.loading && (
        <View style={styles.footer}>
          <Pressable
            onPress={() => setShowOriginal((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showOriginal }}
            hitSlop={8}
          >
            <Text style={styles.link}>
              {showOriginal ? 'Ocultar mensaje original' : `Ver mensaje original de ${firstName}`}
            </Text>
          </Pressable>
          {showOriginal && (
            <View style={styles.box}>
              <Text style={styles.item}>{note}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

TranslationCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  note: PropTypes.string.isRequired,
  freelancerName: PropTypes.string,
  clientName: PropTypes.string,
  isClient: PropTypes.bool,
  stageName: PropTypes.string,
}

export const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  title: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text, marginTop: 4 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  simple: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text, marginTop: 14 },
  box: { backgroundColor: colors.background, borderRadius: 12, padding: 12, marginTop: 10, gap: 6 },
  boxTitle: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  item: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  label: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  bold: { fontFamily: fonts.semibold },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 12 },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, textDecorationLine: 'underline' },
})
