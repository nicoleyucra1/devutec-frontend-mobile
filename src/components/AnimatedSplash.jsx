import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { LOGO_ASPECT_RATIO } from './brand/LogoMark'

// Mismo tamaño y color de fondo que el splash nativo (app.json), así el cambio no se nota
const LOGO_WIDTH = 96
const logo = require('../../assets/images/logo-mark.png')

// Animación de entrada, igual en modo claro y oscuro:
// 1. Sobre negro, el logo crece en el centro mientras gira -135°.
// 2. Vuelve a su tamaño normal y a 0° con un pequeño rebote.
// 3. Abre: el logo se agranda hacia la pantalla mientras el negro se desvanece y aparece la app.
// No termina hasta que `ready` sea true (por ejemplo, cuando ya se leyó la sesión guardada).
// onReveal avisa cuando empieza a abrirse; onFinish, cuando ya no se ve.
export default function AnimatedSplash({ ready, onReveal, onFinish }) {
  // spin va de 0 a 1 (crece y gira) y vuelve a 0 (tamaño normal); al abrir, open agranda el logo
  const spin = useRef(new Animated.Value(0)).current
  const open = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current
  const introDone = useRef(false)
  const exiting = useRef(false)
  // Se guarda en un ref para leer el valor actual cuando termina la animación
  const readyRef = useRef(ready)
  readyRef.current = ready

  const exit = () => {
    if (exiting.current) return
    exiting.current = true
    onReveal?.()
    Animated.parallel([
      Animated.timing(open, { toValue: 9, duration: 600, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => onFinish())
  }

  useEffect(() => {
    // La pantalla ya está dibujada con el mismo logo y fondo que el splash nativo
    SplashScreen.hideAsync().catch(() => {})

    // Con tiempos fijos dura lo mismo en todos los celulares (unos 2 s con la apertura)
    Animated.sequence([
      Animated.delay(150),
      Animated.timing(spin, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(spin, { toValue: 0, duration: 560, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
      Animated.delay(250),
    ]).start(() => {
      introDone.current = true
      if (readyRef.current) exit()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Si la sesión termina de cargar después de la animación, se abre en ese momento
  useEffect(() => {
    if (ready && introDone.current) exit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <StatusBar style="light" />
      <Animated.Image
        source={logo}
        style={{
          width: LOGO_WIDTH,
          height: LOGO_WIDTH / LOGO_ASPECT_RATIO,
          transform: [
            { scale: open },
            { scale: spin.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
            { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-135deg'] }) },
          ],
        }}
        resizeMode="contain"
        accessibilityLabel="Logo de DEV U TEC"
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: '#0E0E0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
