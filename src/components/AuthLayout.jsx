import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import BrandLockup from './brand/BrandLockup'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Contenedor de login y registro: evita que el teclado tape los campos.
// highlight es la parte del título en serif cursiva verde, como en el diseño.
export default function AuthLayout({ title, highlight, subtitle, children }) {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <SafeAreaView style={styles.safe}>
      {/* Botón visible para volver; también se puede deslizar desde el borde izquierdo */}
      {router.canGoBack() && (
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
        >
          <View style={styles.backCircle}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </View>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      )}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandLockup size={16} />
          <Text style={styles.title}>
            {title}
            {highlight ? <Text style={styles.highlight}> {highlight}</Text> : null}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const createStyles = ({ colors, fonts }) => ({
  safe: { flex: 1, backgroundColor: colors.background },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginLeft: 16, marginTop: 8 },
  backPressed: { opacity: 0.6 },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontFamily: fonts.semibold, color: colors.text, fontSize: 16 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 36, letterSpacing: -0.8, color: colors.text, marginTop: 20 },
  highlight: { fontFamily: fonts.serifItalic, fontSize: 36, letterSpacing: -0.5, color: colors.accent },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8, marginBottom: 24 },
})
