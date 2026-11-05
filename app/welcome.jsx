import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PrimaryButton from '../src/components/PrimaryButton'
import { colors } from '../src/theme'

const FEATURES = [
  { icon: 'briefcase-outline', text: 'Proyectos reales de negocios y emprendedores' },
  { icon: 'shield-checkmark-outline', text: 'El pago queda en garantía hasta que entregas' },
  { icon: 'star-outline', text: 'Reseñas de ambos lados para generar confianza' },
]

// Primera pantalla que ve quien no tiene sesión
export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} accessibilityLabel="Logo de DevUTEC" />
        <Text style={styles.title}>DevUTEC</Text>
        <Text style={styles.tagline}>Tu primer proyecto como desarrollador, con el pago asegurado.</Text>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.icon} style={styles.feature}>
              <Ionicons name={feature.icon} size={22} color={colors.primary} />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Crear cuenta" onPress={() => router.push('/register')} />
        <Pressable
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Ya tengo cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  hero: { flex: 1, justifyContent: 'center' },
  logo: { width: 88, height: 88, borderRadius: 20 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 20 },
  tagline: { fontSize: 17, color: colors.muted, marginTop: 8, lineHeight: 24 },
  features: { marginTop: 32, gap: 16 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { flex: 1, fontSize: 15, color: colors.text },
  actions: { paddingBottom: 16 },
  secondary: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  pressed: { opacity: 0.7 },
  secondaryText: { color: colors.text, fontSize: 16, fontWeight: '600' },
})
