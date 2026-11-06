import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Cuyi from '../../src/components/brand/Cuyi'
import PrimaryButton from '../../src/components/PrimaryButton'
import { useAuth } from '../../src/hooks/useAuth'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { ROLE_LABELS } from '../../src/utils/roles'

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const firstName = (user.nombre ?? user.email).split(' ')[0]

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>CUENTA DE {(ROLE_LABELS[user.rol] ?? user.rol).toUpperCase()}</Text>
          <Text style={styles.title}>
            Hola, {firstName}.{'\n'}
            {/* La frase destacada va en su propia línea para que no se parta a la mitad */}
            <Text style={styles.highlight}>{user.rol === 'FREELANCER' ? 'A programar.' : 'Manos a la obra.'}</Text>
          </Text>
        </View>
        <View style={styles.cuyi}>
          <Cuyi anim="saluda" size={72} />
        </View>
      </View>

      <PrimaryButton
        title="Escanear el QR de un freelancer"
        onPress={() => router.push('/scan')}
        icon={<Ionicons name="qr-code-outline" size={20} color={colors.onPrimary} />}
        style={styles.scan}
      />
    </ScrollView>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 18,
  },
  heroText: { flex: 1 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  // Alto de línea de 34 para que la cursiva (más alta que Geist) no se corte arriba ni abajo
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 34, letterSpacing: -0.6, color: colors.text, marginTop: 6 },
  highlight: { fontFamily: fonts.serifItalic, fontSize: 27, color: colors.accent },
  scan: { marginTop: 16 },
  cuyi: { width: 92, height: 92, borderRadius: radius.lg, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
})
