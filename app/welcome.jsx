import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FadeInUp from '../src/components/FadeInUp'
import PrimaryButton from '../src/components/PrimaryButton'
import BrandLockup from '../src/components/brand/BrandLockup'
import PaymentFlow from '../src/components/welcome/PaymentFlow'
import { useThemedStyles } from '../src/hooks/useTheme'

// Primera pantalla que ve quien no tiene sesión: el logo, una animación del pago protegido
// entre cliente y developer, un título corto y los botones. Todo entra en cascada.
export default function WelcomeScreen() {
  const router = useRouter()
  const styles = useThemedStyles(createStyles)

  return (
    <SafeAreaView style={styles.safe}>
      <FadeInUp style={styles.header}>
        <BrandLockup size={16} />
      </FadeInUp>

      <View style={styles.center}>
        <FadeInUp delay={120}>
          <PaymentFlow />
        </FadeInUp>

        <FadeInUp delay={260} style={styles.texts}>
          <Text style={styles.title}>
            Contrata talento junior.
            <Text style={styles.highlight}> Paga cuando apruebes.</Text>
          </Text>
          <Text style={styles.subtitle}>Negocios y estudiantes de UTEC, con el pago protegido de principio a fin.</Text>
        </FadeInUp>
      </View>

      <FadeInUp delay={450} style={styles.actions}>
        <PrimaryButton title="Crear cuenta" onPress={() => router.push('/register')} />
        <PrimaryButton title="Ya tengo cuenta" variant="secondary" onPress={() => router.push('/login')} style={styles.secondary} />
      </FadeInUp>
    </SafeAreaView>
  )
}

const createStyles = ({ colors, fonts }) => ({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  header: { paddingTop: 12 },
  center: { flex: 1, justifyContent: 'center' },
  texts: { marginTop: 44 },
  title: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 37, letterSpacing: -1, color: colors.text },
  highlight: { fontFamily: fonts.serifItalic, fontSize: 38, letterSpacing: -0.6, color: colors.accent },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.muted, marginTop: 12 },
  actions: { paddingBottom: 16 },
  secondary: { marginTop: 10 },
})
