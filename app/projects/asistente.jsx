import { useRef, useState } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ChatBubble from '../../src/components/support/ChatBubble'
import TypingDots from '../../src/components/support/TypingDots'
import DraftCard from '../../src/components/projects/DraftCard'
import StateView from '../../src/components/projects/StateView'
import { assistantService } from '../../src/services/assistantService'
import { useAuth } from '../../src/hooks/useAuth'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { errorMessage } from '../../src/utils/errorMessage'
import { draftStore } from '../../src/utils/draftStore'

const GREETING =
  '¡Hola! Te ayudo a armar tu proyecto en un par de minutos. Para empezar, ¿qué negocio tienes y qué te gustaría lograr con una web, una app o una automatización?'
const MAX_HISTORY = 20
const SUGGESTIONS = ['Tengo una pizzería y quiero recibir pedidos', 'Quiero una web para mostrar mis servicios', 'Necesito automatizar mis reportes en Excel']

// "Nuevo proyecto" empieza conversando con el asistente (Claude en el backend), igual que en la web.
// Pregunta como un consultor y, cuando tiene lo necesario, muestra el proyecto con el precio sugerido y el pago en
// dos partes. "Revisar y publicar" abre el formulario ya lleno. Solo habla del proyecto.
export default function ProjectAssistantScreen() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const [remaining, setRemaining] = useState(null)
  const scrollRef = useRef(null)

  const send = async (raw) => {
    const message = raw.trim()
    if (!message || thinking) return
    // El saludo es local: la conversación que ve la IA empieza con el primer mensaje del cliente
    const history = messages
      .filter((item) => !item.local)
      .slice(-MAX_HISTORY)
      .map(({ role, text: body }) => ({ role, text: body.slice(0, 1500) }))
    setMessages((current) => [...current, { role: 'user', text: message }])
    setText('')
    setError(null)
    setThinking(true)
    try {
      const data = await assistantService.chat({ message, history })
      setRemaining(data.remaining)
      // Si la pregunta era de otro tema, ni ella ni la respuesta fija vuelven a la IA en el historial
      setMessages((current) => [
        ...current.map((item, index) => (data.outOfScope && index === current.length - 1 ? { ...item, local: true } : item)),
        { role: 'assistant', text: data.reply, anim: data.ready ? 'celebra' : 'saluda', local: data.outOfScope },
      ])
      if (data.ready && data.draft) setDraft(data.draft)
    } catch (err) {
      // El mensaje que falló no queda en la conversación, para poder reintentarlo
      setMessages((current) => current.slice(0, -1))
      setText(message)
      setError(err.response?.status === 503 ? 'El asistente no está disponible ahora. Puedes llenar el formulario.' : errorMessage(err))
    } finally {
      setThinking(false)
    }
  }

  const openForm = (fromDraft) => {
    draftStore.set(fromDraft)
    router.replace('/projects/new')
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))

  if (user && user.rol !== 'CLIENT') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTransparent: false, title: 'Nuevo proyecto' }} />
        <StateView title="Solo para clientes" message="Necesitas una cuenta de cliente para publicar proyectos." />
      </>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.round}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Nuevo proyecto</Text>
        <Pressable onPress={() => openForm(null)} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.manual}>Formulario</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          // Con la tarjeta del proyecto abierta no se baja solo: el cliente la lee desde arriba
          if (!draft) scrollRef.current?.scrollToEnd({ animated: true })
        }}
      >
        <View style={styles.intro}>
          <Text style={styles.introKicker}>ASISTENTE DE PROYECTOS</Text>
          <Text style={styles.introTitle}>No necesitas saber de tecnología.</Text>
          <Text style={styles.introText}>
            Cuéntale qué necesita tu negocio. Arma el proyecto, te sugiere un precio con datos reales y te muestra cómo pagas en
            dos partes. Tú revisas todo antes de publicar.
          </Text>
        </View>

        <ChatBubble role="assistant" text={GREETING} anim="saluda">
          {messages.length === 0 ? (
            <View style={styles.chips}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => send(suggestion)}
                  disabled={thinking}
                  style={({ pressed }) => [styles.chip, (pressed || thinking) && styles.dim]}
                  accessibilityRole="button"
                >
                  <Text style={styles.chipText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ChatBubble>
        {messages.map((message, index) => (
          <ChatBubble key={index} role={message.role} text={message.text} anim={message.anim} />
        ))}
        {thinking ? (
          <ChatBubble role="assistant" anim="escribe">
            <TypingDots />
          </ChatBubble>
        ) : null}

        {draft ? <DraftCard draft={draft} onContinue={openForm} onKeepChatting={() => setDraft(null)} /> : null}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => send(text)}
            placeholder="Cuéntame sobre tu negocio…"
            placeholderTextColor={colors.muted}
            maxLength={800}
            returnKeyType="send"
            editable={!thinking}
            style={styles.input}
            accessibilityLabel="Tu mensaje para el asistente"
          />
          <Pressable
            onPress={() => send(text)}
            disabled={!text.trim() || thinking}
            style={[styles.send, (!text.trim() || thinking) && styles.dim]}
            accessibilityRole="button"
            accessibilityLabel="Enviar"
          >
            <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
        <Text style={styles.note}>
          El asistente usa IA y puede equivocarse: revisa el proyecto antes de publicarlo.
          {remaining !== null && remaining <= 5 ? ` Te quedan ${remaining} mensajes hoy.` : ''}
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const createStyles = ({ colors, fonts }) => ({
  flex: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  manual: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
  list: { gap: 12, padding: 16, paddingBottom: 24 },
  intro: { backgroundColor: colors.night, borderRadius: 20, padding: 18, gap: 6 },
  introKicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.lime },
  introTitle: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.4, color: colors.onNight },
  introText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.nightMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  dim: { opacity: 0.5 },
  composer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, paddingTop: 10, gap: 6 },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, backgroundColor: colors.errorLight, borderRadius: 10, padding: 10, overflow: 'hidden' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingLeft: 14,
    paddingRight: 6,
  },
  input: { flex: 1, height: 46, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  send: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  note: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
})
