import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import FadeInUp from '../src/components/FadeInUp'
import PrimaryButton from '../src/components/PrimaryButton'
import WelcomeIllustration from '../src/components/welcome/WelcomeIllustration'
import { colors } from '../src/theme'

// Le habla a los dos tipos de usuario: quien contrata y quien trabaja
const FEATURES = [
  { icon: 'briefcase-outline', title: '¿Necesitas software?', text: 'Publica tu proyecto y elige entre quienes postulan.' },
  { icon: 'code-slash-outline', title: '¿Eres desarrollador?', text: 'Postula a proyectos reales y gana experiencia.' },
  { icon: 'shield-checkmark-outline', text: 'El pago queda en garantía hasta que se confirma la entrega.' },
]

// Primera pantalla que ve quien no tiene sesión. Todo entra en cascada: dibujo, título, puntos y botones.
export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInUp distance={30}>
          <WelcomeIllustration />
        </FadeInUp>

        <FadeInUp delay={150}>
          <Text style={styles.title}>
            Dev<Text style={styles.titleAccent}>utec</Text>
          </Text>
          <Text style={styles.tagline}>
            Conecta negocios que necesitan software con desarrolladores junior, con el pago en garantía.
          </Text>
        </FadeInUp>

        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <FadeInUp key={feature.icon} delay={300 + index * 120} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>
                {feature.title ? <Text style={styles.featureTitle}>{feature.title} </Text> : null}
                {feature.text}
              </Text>
            </FadeInUp>
          ))}
        </View>
      </ScrollView>

      <FadeInUp delay={700} style={styles.actions}>
        <PrimaryButton title="Crear cuenta" onPress={() => router.push('/register')} />
        <Pressable
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Ya tengo cuenta</Text>
        </Pressable>
      </FadeInUp>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 8 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 8 },
  titleAccent: { color: colors.primary },
  tagline: { fontSize: 16, color: colors.muted, marginTop: 6, lineHeight: 23 },
  features: { marginTop: 22, gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  featureTitle: { fontWeight: '700' },
  actions: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
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
