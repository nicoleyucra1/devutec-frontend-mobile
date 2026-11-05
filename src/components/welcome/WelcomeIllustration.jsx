import { Image, StyleSheet, View } from 'react-native'
import FloatingIcon from './FloatingIcon'
import { colors } from '../../theme'

// Dibujo de la bienvenida: el logo en una tarjeta, manchas de color de fondo
// e íconos flotando que representan lo que hace Devutec
export default function WelcomeIllustration() {
  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobBig]} />
      <View style={[styles.blob, styles.blobSmall]} />

      <View style={styles.card}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo de Devutec"
        />
      </View>

      <FloatingIcon icon="code-slash" color={colors.white} background={colors.primary} duration={2600} style={{ top: 18, left: 28 }} />
      <FloatingIcon icon="briefcase" color="#b45309" background="#fef3c7" duration={3000} style={{ top: 6, right: 40 }} />
      <FloatingIcon icon="shield-checkmark" color="#047857" background="#d1fae5" size={58} duration={2800} style={{ bottom: 14, left: 46 }} />
      <FloatingIcon icon="star" color="#be185d" background="#fce7f3" size={46} duration={2200} style={{ bottom: 30, right: 26 }} />
      <FloatingIcon icon="chatbubbles" color={colors.primary} background={colors.primaryLight} size={40} duration={3400} style={{ top: 108, right: 4 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { height: 260, alignItems: 'center', justifyContent: 'center' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobBig: { width: 230, height: 230, backgroundColor: colors.primaryLight },
  blobSmall: { width: 120, height: 120, backgroundColor: '#e0e7ff', top: 8, left: 10 },
  card: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#312e81',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logo: { width: 92, height: 80 },
})
