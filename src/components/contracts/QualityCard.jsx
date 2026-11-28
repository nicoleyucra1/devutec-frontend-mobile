import { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { contractService } from '../../services/contractService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatDate } from '../../utils/format'
import { createStyles as createCardStyles } from './TranslationCard'
import { translationError } from './translationError'

const STATUS = {
  PASSED: { label: 'Cumple el estándar', anim: 'celebra' },
  FAILED: { label: 'Todavía no cumple', anim: 'confundido' },
  UNAVAILABLE: { label: 'No se pudo medir', anim: 'confundido' },
}

// Estándar de calidad de DEVUTEC en la entrega final de un proyecto web.
// El estudiante revisa su web publicada con PageSpeed de Google: si no llega a los mínimos, no puede entregar y
// Cuyi le da las tareas para arreglarla antes de la fecha de la etapa. El cliente ve el resultado en simple.
export default function QualityCard({ contractId, stage, isClient, freelancerName }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [overview, setOverview] = useState(null)
  const [url, setUrl] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [showIssues, setShowIssues] = useState(false)
  const firstName = freelancerName?.split(' ')[0] ?? 'El estudiante'

  useEffect(() => {
    let active = true
    contractService
      .getQuality(contractId, stage.id)
      .then((data) => {
        if (!active) return
        setOverview(data)
        if (data.last?.url) setUrl(data.last.url)
      })
      .catch(() => active && setOverview(null))
    return () => {
      active = false
    }
  }, [contractId, stage.id])

  if (!overview?.required) return null
  const last = overview.last
  const canCheck = !isClient && stage.status !== 'APPROVED' && stage.status !== 'CANCELLED'
  // El cliente solo ve la tarjeta cuando ya hay una revisión
  if (isClient && !last) return null

  const check = async () => {
    if (!url.trim()) {
      setError('Pega el link de tu web publicada')
      return
    }
    setChecking(true)
    setError(null)
    try {
      const result = await contractService.checkQuality(contractId, stage.id, url.trim())
      setOverview((prev) => ({ ...prev, last: result }))
    } catch (err) {
      setError(translationError(err))
    } finally {
      setChecking(false)
    }
  }

  const status = last ? STATUS[last.status] : null

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim={checking ? 'escribe' : (status?.anim ?? 'saluda')} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>ESTÁNDAR DE CALIDAD DEVUTEC</Text>
          <Text style={styles.title}>
            {isClient ? 'Así está tu web antes de la entrega final' : 'Revisa tu web antes de la entrega final'}
          </Text>
        </View>
      </View>

      {status ? (
        <Text style={[styles.badge, last.status === 'PASSED' ? styles.badgeOk : styles.badgeWarn]}>{status.label}</Text>
      ) : null}

      {!isClient ? (
        <Text style={[styles.muted, { marginTop: 10 }]}>
          Para entregar, tu web publicada tiene que cumplir los mínimos de velocidad, accesibilidad, buenas prácticas y SEO
          en celular, y usar HTTPS.{stage.dueDate ? ` Tienes hasta el ${formatDate(stage.dueDate)}.` : ''}
        </Text>
      ) : null}

      {canCheck ? (
        <>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://mi-pizzeria.vercel.app"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!checking}
            accessibilityLabel="Link de tu web publicada"
            style={styles.input}
          />
          <PrimaryButton
            title={checking ? 'Midiendo…' : last ? 'Revisar de nuevo' : 'Revisar mi web'}
            onPress={check}
            loading={checking}
          />
        </>
      ) : null}
      {checking ? (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.muted}>Google está midiendo tu web. Puede tardar hasta 40 segundos.</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {last && !checking ? (
        <>
          {last.status === 'UNAVAILABLE' ? (
            <View style={styles.box}>
              <Text style={styles.muted}>
                {isClient
                  ? 'Esta vez no se pudo medir la web por una falla de Google.'
                  : 'Google no respondió esta vez. Puedes intentarlo de nuevo; si sigue fallando, igual puedes entregar.'}
              </Text>
            </View>
          ) : null}

          {last.scores.length ? (
            <View style={styles.scores}>
              {last.scores.map((score) => (
                <View
                  key={score.key}
                  style={styles.score}
                  accessible
                  accessibilityLabel={`${score.label}: ${score.value} de 100, mínimo ${score.minimum}`}
                >
                  <Text style={[styles.scoreValue, { color: score.passed ? colors.accent : colors.pending }]}>
                    {score.value}
                  </Text>
                  <Text style={styles.scoreLabel}>{score.label}</Text>
                  <Text style={styles.scoreMin}>mínimo {score.minimum}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {last.https !== null ? (
            <Pressable onPress={() => Linking.openURL(last.url)} accessibilityRole="link">
              <Text style={[styles.muted, { textAlign: 'center', marginTop: 8 }]}>
                {last.https ? '🔒 Usa HTTPS' : '⚠️ No usa HTTPS'} · {last.url.replace(/^https?:\/\//, '')}
              </Text>
            </Pressable>
          ) : null}

          {isClient ? (
            <Text style={styles.simple}>
              {last.status === 'PASSED'
                ? 'Tu web cumple el estándar de calidad de DEVUTEC: carga bien en celulares y es segura.'
                : (last.forClient ?? `${firstName} está haciendo ajustes para que tu web cumpla el estándar antes de entregarla.`)}
            </Text>
          ) : (
            <>
              {last.failures.length ? (
                <View style={[styles.box, styles.warning]}>
                  <Text style={styles.label}>LO QUE NO CUMPLE</Text>
                  {last.failures.map((failure) => (
                    <Text key={failure} style={styles.item}>
                      {failure}
                    </Text>
                  ))}
                </View>
              ) : null}
              {last.tasks.length ? (
                <View style={styles.box}>
                  <Text style={styles.label}>CUYI TE SUGIERE</Text>
                  {last.tasks.map((task, index) => (
                    <Text key={task} style={styles.item}>
                      {index + 1}. {task}
                    </Text>
                  ))}
                </View>
              ) : null}
              {last.status === 'PASSED' ? (
                <Text style={styles.simple}>✅ Tu web cumple el estándar. Ya puedes hacer la entrega final.</Text>
              ) : null}
              {last.issues.length ? (
                <View style={styles.footer}>
                  <Pressable onPress={() => setShowIssues((open) => !open)} accessibilityRole="button">
                    <Text style={styles.link}>
                      {showIssues ? 'Ocultar el detalle de Google' : `Ver el detalle de Google (${last.issues.length})`}
                    </Text>
                  </Pressable>
                  {showIssues
                    ? last.issues.map((issue) => (
                        <Text key={`${issue.category}-${issue.title}`} style={[styles.muted, { marginTop: 6 }]}>
                          <Text style={styles.bold}>{issue.category}:</Text> {issue.title}
                          {issue.detail ? ` (${issue.detail})` : ''}
                        </Text>
                      ))
                    : null}
                </View>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </View>
  )
}

QualityCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    status: PropTypes.string,
    dueDate: PropTypes.string,
  }).isRequired,
  isClient: PropTypes.bool,
  freelancerName: PropTypes.string,
}

const createStyles = (theme) => ({
  ...createCardStyles(theme),
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
  },
  badgeOk: { backgroundColor: theme.colors.accentLight, color: theme.colors.accent },
  badgeWarn: { backgroundColor: theme.colors.pendingLight, color: theme.colors.pending },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
  },
  error: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.error, marginTop: 8 },
  warning: { backgroundColor: theme.colors.pendingLight },
  scores: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, rowGap: 12 },
  score: { width: '50%', alignItems: 'center' },
  scoreValue: { fontFamily: theme.fonts.bold, fontSize: 28 },
  scoreLabel: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.text },
  scoreMin: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.muted },
})
