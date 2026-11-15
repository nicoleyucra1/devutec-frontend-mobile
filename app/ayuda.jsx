import { useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ChatBubble from '../src/components/support/ChatBubble'
import TypingDots from '../src/components/support/TypingDots'
import { FAQ } from '../src/components/support/faq'
import { supportService } from '../src/services/supportService'
import { useTheme, useThemedStyles } from '../src/hooks/useTheme'

const GREETING = '¡Hola! Soy Cuyi 🐹 ¿En qué te ayudo? Pregúntame lo que quieras sobre DEVUTEC o elige una de estas:'
const MAX_HISTORY = 8

// Respuestas de Cuyi cuando la IA no puede contestar
function fallbackFor(status) {
  if (status === 429) return { text: 'Por hoy ya me hiciste muchas preguntas 😅 Mañana sigo. Mientras tanto, mira estas:', anim: 'duerme' }
  if (!status) return { text: 'Parece que no hay conexión con el servidor 😵 Revisa tu internet. Estas te pueden servir:', anim: 'confundido' }
  return { text: 'Ahora no puedo pensar bien 😵 Pero estas preguntas frecuentes te pueden servir:', anim: 'confundido' }
}

// Chat de ayuda con Cuyi (IA de Gemini en el backend). Si la IA falla, responde con las preguntas frecuentes guardadas.
export default function AyudaScreen() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const scrollRef = useRef(null)

  const ask = async (question) => {
    const clean = question.trim()
    if (!clean || thinking) return
    const history = messages
      .filter((message) => message.text && !message.local)
      .slice(-MAX_HISTORY)
      .map(({ role, text: body }) => ({ role, text: body.slice(0, 1500) }))
    setMessages((current) => [...current, { role: 'user', text: clean }])
    setText('')
    setThinking(true)
    try {
      const data = await supportService.ask({ message: clean, history })
      setRemaining(data.remaining)
      setMessages((current) => [...current, { role: 'assistant', text: data.reply, anim: 'saluda' }])
    } catch (error) {
      const known = FAQ.find((item) => item.q === clean)
      if (known) {
        setMessages((current) => [...current, { role: 'assistant', text: known.a, anim: 'saluda', local: true }])
      } else {
        const fallback = fallbackFor(error.response?.status)
        setMessages((current) => [...current, { role: 'assistant', ...fallback, local: true, suggestions: true }])
      }
    } finally {
      setThinking(false)
    }
  }

  const suggestions = (
    <View style={styles.chips}>
      {FAQ.map((item) => (
        <Pressable
          key={item.q}
          onPress={() => ask(item.q)}
          disabled={thinking}
          style={({ pressed }) => [styles.chip, (pressed || thinking) && styles.dim]}
          accessibilityRole="button"
        >
          <Text style={styles.chipText}>{item.q}</Text>
        </Pressable>
      ))}
    </View>
  )

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ headerShown: true, headerTransparent: false, title: 'Ayuda con Cuyi' }} />
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <ChatBubble role="assistant" text={GREETING} anim="saluda">
          {suggestions}
        </ChatBubble>
        {messages.map((message, index) => (
          <ChatBubble key={index} role={message.role} text={message.text} anim={message.anim}>
            {message.suggestions ? suggestions : null}
          </ChatBubble>
        ))}
        {thinking ? (
          <ChatBubble role="assistant" anim="escribe">
            <TypingDots />
          </ChatBubble>
        ) : null}
      </ScrollView>

      <View style={styles.composer}>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => ask(text)}
            placeholder="Escribe tu pregunta…"
            placeholderTextColor={colors.muted}
            maxLength={500}
            returnKeyType="send"
            style={styles.input}
            accessibilityLabel="Tu pregunta para Cuyi"
          />
          <Pressable
            onPress={() => ask(text)}
            disabled={!text.trim() || thinking}
            style={[styles.send, (!text.trim() || thinking) && styles.dim]}
            accessibilityRole="button"
            accessibilityLabel="Enviar"
          >
            <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
        <Text style={styles.note}>
          Cuyi usa IA y puede equivocarse.{remaining !== null && remaining <= 5 ? ` Te quedan ${remaining} preguntas hoy.` : ''}
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const createStyles = ({ colors, fonts }) => ({
  flex: { flex: 1, backgroundColor: colors.background },
  list: { gap: 12, padding: 16, paddingBottom: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  dim: { opacity: 0.5 },
  composer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, padding: 12, gap: 6 },
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
