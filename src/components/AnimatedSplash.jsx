import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { colors } from '../theme'

// Mismo tamaño que el logo del splash nativo (imageWidth en app.json),
// así el cambio del splash nativo a esta animación no se nota
export const SPLASH_LOGO_WIDTH = 160

const logo = require('../../assets/splash-icon.png')
// Ancho dividido entre alto de splash-icon.png
const LOGO_ASPECT_RATIO = 800 / 699

// Animación de entrada: el logo hace "pop", aparece el nombre y todo se desvanece con un zoom.
// No termina hasta que `ready` sea true (por ejemplo, cuando ya se leyó la sesión guardada).
export default function AnimatedSplash({ ready, onFinish }) {
  const logoScale = useRef(new Animated.Value(1)).current
  const nameOpacity = useRef(new Animated.Value(0)).current
  const nameShift = useRef(new Animated.Value(12)).current
  const screenOpacity = useRef(new Animated.Value(1)).current
  const introDone = useRef(false)
  const exiting = useRef(false)

  const exit = () => {
    if (exiting.current) return
    exiting.current = true
    Animated.parallel([
      Animated.timing(logoScale, { toValue: 6, duration: 450, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(screenOpacity, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => onFinish())
  }

  useEffect(() => {
    // La pantalla ya está dibujada encima: se puede ocultar el splash nativo sin parpadeo
    SplashScreen.hideAsync().catch(() => {})

    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1.12, friction: 4, tension: 80, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(nameOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(nameShift, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(450),
    ]).start(() => {
      introDone.current = true
      if (ready) exit()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Si la sesión termina de cargar después de la animación, se sale en ese momento
  useEffect(() => {
    if (ready && introDone.current) exit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]} pointerEvents="none">
      <Animated.Image
        source={logo}
        style={{
          width: SPLASH_LOGO_WIDTH,
          height: SPLASH_LOGO_WIDTH / LOGO_ASPECT_RATIO,
          transform: [{ scale: logoScale }],
        }}
        resizeMode="contain"
        accessibilityLabel="Logo de DevUTEC"
      />
      <Animated.Text style={[styles.name, { opacity: nameOpacity, transform: [{ translateY: nameShift }] }]}>
        Dev<Animated.Text style={styles.nameAccent}>UTEC</Animated.Text>
      </Animated.Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { position: 'absolute', bottom: '30%', fontSize: 30, fontWeight: '800', color: colors.text },
  nameAccent: { color: colors.primary },
})
