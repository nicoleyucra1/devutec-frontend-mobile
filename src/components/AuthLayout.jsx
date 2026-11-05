import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import BrandLockup from './brand/BrandLockup'
import Cuyi from './brand/Cuyi'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

const TABS = [
  { key: 'login', label: 'Ingresar', href: '/login' },
  { key: 'register', label: 'Crear cuenta', href: '/register' },
]

// Pantalla de ingreso del diseño (M1): marca, Cuyi saludando, el título y las pestañas
// Ingresar / Crear cuenta. Cada pestaña es su propia ruta; al cambiar se reemplaza la pantalla.
export default function AuthLayout({ tab, children }) {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            {/* Botón visible para volver; también se puede deslizar desde el borde izquierdo */}
            {router.canGoBack() && (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Volver"
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
            )}
            <BrandLockup size={15} />
            <View style={styles.flex} />
            <View style={styles.protected}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.accent} />
              <Text style={styles.protectedText}>Pagos protegidos</Text>
            </View>
          </View>

          <View style={styles.cuyi}>
            <Cuyi anim="saluda" size={48} />
          </View>

          <Text style={styles.title}>
            Trabajo junior,{'\n'}
            <Text style={styles.highlight}>pago protegido.</Text>
          </Text>
          <Text style={styles.subtitle}>Ningún pago se mueve sin tu confirmación.</Text>

          <View style={styles.tabs} accessibilityRole="tablist">
            {TABS.map((item) => {
              const selected = item.key === tab
              return (
                <Pressable
                  key={item.key}
                  onPress={() => !selected && router.replace(item.href)}
                  style={[styles.tab, selected && styles.tabSelected]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{item.label}</Text>
                </Pressable>
              )
            })}
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const createStyles = ({ colors, fonts, radius, isDark }) => ({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  protected: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  protectedText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.accent },
  cuyi: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 35, letterSpacing: -1.2, color: colors.text, marginTop: 20 },
  highlight: { fontFamily: fonts.serifItalic, fontSize: 36, letterSpacing: -0.6, color: colors.accent },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 8 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 4,
    marginTop: 24,
    marginBottom: 20,
  },
  tab: { flex: 1, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabSelected: {
    backgroundColor: isDark ? colors.border : colors.card,
    shadowColor: '#0E0E0C',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted },
  tabTextSelected: { color: colors.text },
})
