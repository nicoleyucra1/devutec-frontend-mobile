import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { colors } from '../theme'

const LOGO_WIDTH = 150
// Ancho dividido entre alto de logo-white.png
const LOGO_ASPECT_RATIO = 800 / 699
const logo = require('../../assets/images/logo-white.png')

// Onda que sale del centro y se desvanece, detrás del logo
function Ripple({ progress }) {
  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          opacity: progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] }) }],
        },
      ]}
    />
  )
}

// Animación de entrada sobre el color de la marca: el logo aparece con un "pop", salen dos ondas,
// aparece el nombre y la pantalla sube como una cortina para mostrar la app.
// No termina hasta que `ready` sea true (por ejemplo, cuando ya se leyó la sesión guardada).
export default function AnimatedSplash({ ready, onFinish }) {
  const { height } = useWindowDimensions()
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const ripple1 = useRef(new Animated.Value(0)).current
  const ripple2 = useRef(new Animated.Value(0)).current
  const nameOpacity = useRef(new Animated.Value(0)).current
  const nameShift = useRef(new Animated.Value(16)).current
  const curtain = useRef(new Animated.Value(0)).current
  const introDone = useRef(false)
  const exiting = useRef(false)
  // Se guarda en un ref para leer el valor actual cuando termina la animación
  const readyRef = useRef(ready)
  readyRef.current = ready

  const exit = () => {
    if (exiting.current) return
    exiting.current = true
    Animated.timing(curtain, {
      toValue: 1,
      duration: 550,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onFinish())
  }

  useEffect(() => {
    // El splash nativo es solo el color de fondo, así que se puede ocultar sin que se note el cambio
    SplashScreen.hideAsync().catch(() => {})

    const wave = (value) => Animated.timing(value, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true })

    // Con tiempos fijos dura lo mismo en todos los celulares (unos 2 s con la salida)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 550, easing: Easing.out(Easing.back(2.5)), useNativeDriver: true }),
        Animated.stagger(250, [wave(ripple1), wave(ripple2)]),
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(nameOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(nameShift, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
        ]),
      ]),
      Animated.delay(150),
    ]).start(() => {
      introDone.current = true
      if (readyRef.current) exit()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Si la sesión termina de cargar después de la animación, se sale en ese momento
  useEffect(() => {
    if (ready && introDone.current) exit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY: curtain.interpolate({ inputRange: [0, 1], outputRange: [0, -height] }) }] }]}
    >
      <StatusBar style="light" />
      <View style={styles.center}>
        <Ripple progress={ripple1} />
        <Ripple progress={ripple2} />
        <Animated.Image
          source={logo}
          style={{
            width: LOGO_WIDTH,
            height: LOGO_WIDTH / LOGO_ASPECT_RATIO,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
          resizeMode="contain"
          accessibilityLabel="Logo de Devutec"
        />
      </View>
      <Animated.Text style={[styles.name, { opacity: nameOpacity, transform: [{ translateY: nameShift }] }]}>
        Dev<Animated.Text style={styles.nameAccent}>utec</Animated.Text>
      </Animated.Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  ripple: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: colors.white,
  },
  name: { marginTop: 28, fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
  nameAccent: { color: '#c7d2fe' },
})
