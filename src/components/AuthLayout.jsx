import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

// Contenedor de login y registro: evita que el teclado tape los campos
export default function AuthLayout({ title, subtitle, children }) {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      {router.canGoBack() && (
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Volver" hitSlop={12}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
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
  back: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  backText: { color: colors.primary, fontSize: 16 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 4 },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: 24 },
})
