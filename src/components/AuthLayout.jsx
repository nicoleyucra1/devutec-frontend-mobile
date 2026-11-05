import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

// Contenedor de login y registro: evita que el teclado tape los campos
export default function AuthLayout({ title, subtitle, children }) {
  const router = useRouter()

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
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </View>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      )}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>Devutec</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginLeft: 16, marginTop: 8 },
  backPressed: { opacity: 0.6 },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 4 },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: 24 },
})
