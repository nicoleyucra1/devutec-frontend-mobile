import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { contractService } from '../../services/contractService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { createStyles as createCardStyles } from './TranslationCard'
import { translationError } from './translationError'

// IA traductora para el estudiante: convierte lo que pidió el cliente («que se vea más moderno») en tareas
// concretas y en preguntas para confirmar.
// - Con request (el pedido de cambios que el cliente dejó en la etapa): se traduce solo al abrir el contrato.
// - Sin request: el estudiante pega un mensaje del cliente y lo traduce cuando quiere.
export default function ClientRequestTranslator({ contractId, clientName, stageName, request }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(Boolean(request))
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const client = clientName?.split(' ')[0] ?? 'el cliente'

  useEffect(() => {
    if (!request) return undefined
    let active = true
    contractService
      .translate(contractId, { direction: 'FOR_STUDENT', text: request, stageName })
      .then((data) => active && setResult(data.result))
      .catch((err) => active && setError(translationError(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [contractId, request, stageName])

  const translate = async () => {
    if (!text.trim()) {
      setError(`Pega lo que te escribió ${client}`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await contractService.translate(contractId, { direction: 'FOR_STUDENT', text: text.trim(), stageName })
      setResult(data.result)
    } catch (err) {
      setError(translationError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim={loading ? 'escribe' : 'saluda'} size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            {request
              ? `${client.toUpperCase()} PIDIÓ CAMBIOS${stageName ? ` EN ${stageName.toUpperCase()}` : ''}`
              : 'TRADUCTOR DE PEDIDOS'}
          </Text>
          <Text style={styles.title}>{request ? `Qué quiere ${client}, en concreto` : `¿Qué quiso decir ${client}?`}</Text>
        </View>
      </View>

      {request ? (
        <>
          <View style={styles.box}>
            <Text style={styles.label}>LO QUE ESCRIBIÓ {client.toUpperCase()}</Text>
            <Text style={styles.item}>{request}</Text>
          </View>
          {loading && (
            <View style={styles.loading} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.muted}>Cuyi está leyendo el pedido de {client}...</Text>
            </View>
          )}
          {error && <Text style={[styles.error, { marginTop: 10 }]}>{error}</Text>}
        </>
      ) : (
        <>
          <Text style={[styles.muted, { marginTop: 8 }]}>
            Pega un pedido o comentario de {client} y Cuyi te lo convierte en tareas y en preguntas para confirmar.
          </Text>
          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value)
              setError(null)
            }}
            multiline
            maxLength={2000}
            placeholder="Por ejemplo: «Quiero que se vea más moderno y más alegre»"
            placeholderTextColor={colors.muted}
            accessibilityLabel={`Mensaje de ${client}`}
            style={styles.input}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <PrimaryButton title={loading ? 'Traduciendo...' : 'Traducir pedido'} loading={loading} onPress={translate} />
        </>
      )}

      {result && (
        <View style={styles.footer} accessibilityLiveRegion="polite">
          <Text style={[styles.simple, { marginTop: 0 }]}>{result.enSimple}</Text>
          {result.tareas?.length > 0 && (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Qué hacer</Text>
              {result.tareas.map((task) => (
                <Text key={task} style={styles.item}>
                  ☐ {task}
                </Text>
              ))}
            </View>
          )}
          {result.preguntas?.length > 0 && (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Pregúntale a {client}</Text>
              {result.preguntas.map((question) => (
                <Text key={question} style={styles.item}>
                  «{question}»
                </Text>
              ))}
            </View>
          )}
          {result.ojo ? (
            <View style={[styles.box, styles.warning]}>
              <Text style={[styles.item, { color: colors.pending }]}>
                <Text style={styles.bold}>Ojo: </Text>
                {result.ojo}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  )
}

ClientRequestTranslator.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  clientName: PropTypes.string,
  stageName: PropTypes.string,
  request: PropTypes.string,
}

const createStyles = (theme) => ({
  ...createCardStyles(theme),
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  error: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.error, marginBottom: 8 },
  warning: { backgroundColor: theme.colors.pendingLight },
})
