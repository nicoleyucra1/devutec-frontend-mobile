import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import FadeInUp from '../src/components/FadeInUp'
import PrimaryButton from '../src/components/PrimaryButton'
import Wordmark from '../src/components/brand/Wordmark'
import WelcomeIllustration from '../src/components/welcome/WelcomeIllustration'
import { useTheme, useThemedStyles } from '../src/hooks/useTheme'

// Le habla a los dos tipos de usuario: quien contrata y quien trabaja
const FEATURES = [
  { icon: 'storefront-outline', title: '¿Necesitas software?', text: 'Publica tu proyecto y elige entre quienes postulan.' },
  { icon: 'code-slash-outline', title: '¿Estudias en UTEC?', text: 'Postula a proyectos reales y arma tu portafolio.' },
  { icon: 'shield-checkmark-outline', text: 'El pago queda en garantía hasta que se aprueba la entrega.' },
]

// Primera pantalla que ve quien no tiene sesión. Todo entra en cascada: dibujo, título, puntos y botones.
export default function WelcomeScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInUp>
          <Wordmark size={16} />
        </FadeInUp>

        <FadeInUp distance={30} delay={80}>
          <WelcomeIllustration />
        </FadeInUp>

        <FadeInUp delay={180}>
          <Text style={styles.eyebrow}>TALENTO UTEC · PAGOS PROTEGIDOS</Text>
          <Text style={styles.title}>
            Trabajo real para talento junior.
            <Text style={styles.highlight}> Pago protegido.</Text>
          </Text>
        </FadeInUp>

        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <FadeInUp key={feature.icon} delay={320 + index * 110} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={18} color={colors.text} />
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
        <PrimaryButton title="Ya tengo cuenta" variant="secondary" onPress={() => router.push('/login')} style={styles.secondary} />
      </FadeInUp>
    </SafeAreaView>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 12 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, color: colors.muted, marginTop: 8 },
  title: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 33, letterSpacing: -0.9, color: colors.text, marginTop: 8 },
  highlight: { fontFamily: fonts.serifItalic, fontSize: 34, letterSpacing: -0.6, color: colors.accent },
  features: { marginTop: 18, gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 20 },
  featureTitle: { fontFamily: fonts.bold },
  actions: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  secondary: { marginTop: 10 },
})
