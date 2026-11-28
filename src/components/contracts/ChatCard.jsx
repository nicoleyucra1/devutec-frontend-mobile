import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, AppState, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import PropTypes from 'prop-types'
import Cuyi from '../brand/Cuyi'
import PrimaryButton from '../PrimaryButton'
import { chatService } from '../../services/chatService'
import { contractService } from '../../services/contractService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'
import { createStyles as createCardStyles } from './TranslationCard'
import { translationError } from './translationError'

const POLL_MS = 5000
const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' })
const DAY = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })

function when(value) {
  const date = new Date(value)
  return new Date().toDateString() === date.toDateString() ? TIME.format(date) : `${DAY.format(date)} · ${TIME.format(date)}`
}

// «Cuyi te lo explica» debajo de un mensaje recibido: usa la traductora (al cliente le explica lo técnico; al
// estudiante le convierte el pedido en tareas). Se pide solo al tocarlo.
function Explain({ contractId, text, isClient }) {
  const styles = useThemedStyles(createStyles)
  const [state, setState] = useState({ open: false, loading: false, data: null, error: null })

  const load = () => {
    setState({ open: true, loading: true, data: null, error: null })
    contractService
      .translate(contractId, { direction: isClient ? 'FOR_CLIENT' : 'FOR_STUDENT', text })
      .then((data) => setState({ open: true, loading: false, data: data.result, error: null }))
      .catch((err) => setState({ open: true, loading: false, data: null, error: translationError(err) }))
  }

  if (!state.open) {
    return (
      <Pressable onPress={load} accessibilityRole="button" hitSlop={8}>
        <Text style={styles.explainLink}>✨ Cuyi te lo explica</Text>
      </Pressable>
    )
  }
  const items = state.data ? [...(state.data.tareas ?? []), ...(state.data.falta ?? []), ...(state.data.revisaEsto ?? [])] : []
  return (
    <View style={styles.explainBox} accessibilityLiveRegion="polite">
      {state.loading ? <Text style={styles.muted}>Cuyi está leyendo el mensaje…</Text> : null}
      {state.error ? <Text style={styles.muted}>{state.error}</Text> : null}
      {state.data ? (
        <>
          <Text style={styles.explainText}>{state.data.enSimple}</Text>
          {items.slice(0, 4).map((item) => (
            <Text key={item} style={styles.explainText}>
              • {item}
            </Text>
          ))}
        </>
      ) : null}
    </View>
  )
}

Explain.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  text: PropTypes.string.isRequired,
  isClient: PropTypes.bool,
}

// Chat del contrato: el cliente y el estudiante conversan dentro de DEVUTEC (dudas a mitad de una etapa, avisos).
// Se actualiza solo cada 5 segundos mientras la app está abierta (mensajes nuevos y «Leído»). Los celulares,
// correos y pagos por fuera los bloquea el backend y el motivo se muestra aquí.
export default function ChatCard({ contractId, otherName, isClient, closed }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [messages, setMessages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const listRef = useRef(null)
  const otherFirst = otherName?.split(' ')[0] ?? (isClient ? 'el estudiante' : 'el cliente')

  useEffect(() => {
    let active = true
    const load = () =>
      chatService
        .list(contractId)
        .then((data) => {
          if (!active) return
          setMessages(data)
          setLoaded(true)
        })
        .catch(() => active && setLoaded(true))
    load()
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') load()
    }, POLL_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [contractId])

  const send = async () => {
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    setError(null)
    try {
      const message = await chatService.send(contractId, value)
      setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]))
      setText('')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Cuyi anim="saluda" size={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>MENSAJES</Text>
          <Text style={styles.title}>Conversa con {otherFirst}</Text>
        </View>
      </View>
      <Text style={[styles.muted, { marginTop: 8 }]}>
        Para dudas a mitad de una etapa. Todo queda aquí y tu pago sigue protegido: no se comparten celulares ni pagos
        por fuera.
      </Text>

      <ScrollView
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        nestedScrollEnabled
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        accessibilityLabel={`Mensajes con ${otherFirst}`}
      >
        {!loaded ? <ActivityIndicator color={colors.accent} /> : null}
        {loaded && messages.length === 0 ? (
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            Todavía no hay mensajes. Escríbele a {otherFirst} si tienes una duda sobre el proyecto.
          </Text>
        ) : null}
        {messages.map((message) => (
          <View key={message.id} style={[styles.row, message.mine ? styles.rowMine : styles.rowOther]}>
            <View style={[styles.bubble, message.mine ? styles.bubbleMine : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, message.mine && styles.bubbleTextMine]}>{message.text}</Text>
            </View>
            <Text style={styles.meta}>
              {message.mine ? 'Tú' : message.senderName?.split(' ')[0]} · {when(message.createdAt)}
              {message.mine ? (message.read ? ' · ✓✓ Leído' : ' · ✓ Enviado') : ''}
            </Text>
            {!message.mine ? <Explain contractId={contractId} text={message.text} isClient={isClient} /> : null}
          </View>
        ))}
      </ScrollView>

      {closed ? (
        <Text style={[styles.muted, { marginTop: 10 }]}>Este contrato se cerró: el chat queda solo para leer.</Text>
      ) : (
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`Escribe a ${otherFirst}…`}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={1000}
            accessibilityLabel={`Mensaje para ${otherFirst}`}
            style={styles.input}
          />
          <PrimaryButton title="Enviar" onPress={send} loading={sending} disabled={!text.trim()} style={styles.sendButton} />
        </View>
      )}
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

ChatCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  otherName: PropTypes.string,
  isClient: PropTypes.bool,
  closed: PropTypes.bool,
}

const createStyles = (theme) => ({
  ...createCardStyles(theme),
  list: { maxHeight: 340, marginTop: 14, backgroundColor: theme.colors.background, borderRadius: 14 },
  listContent: { padding: 10, gap: 10 },
  row: { maxWidth: '85%' },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMine: { backgroundColor: theme.colors.accent, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: theme.fonts.regular, fontSize: 14, lineHeight: 20, color: theme.colors.text },
  bubbleTextMine: { color: '#FFFFFF' },
  meta: { fontFamily: theme.fonts.regular, fontSize: 10, color: theme.colors.muted, marginTop: 2 },
  explainLink: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.accent, marginTop: 4, textDecorationLine: 'underline' },
  explainBox: { marginTop: 6, borderRadius: 10, padding: 8, backgroundColor: theme.colors.accentLight, gap: 2 },
  explainText: { fontFamily: theme.fonts.regular, fontSize: 12, lineHeight: 17, color: theme.colors.text },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 10 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
  },
  sendButton: { minWidth: 84 },
  error: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.error, marginTop: 8 },
})
