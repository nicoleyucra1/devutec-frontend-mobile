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
// 3. Abre de frente: la pantalla negra se quita de golpe, sin transparencias, y aparece la app.
// No termina hasta que `ready` sea true (por ejemplo, cuando ya se leyó la sesión guardada).
// onFinish avisa que terminó, para mostrar la app.
export default function AnimatedSplash({ ready, onFinish }) {
  // spin va de 0 a 1 (crece y gira) y vuelve a 0 (tamaño normal)
  const spin = useRef(new Animated.Value(0)).current
  const introDone = useRef(false)
  const exiting = useRef(false)
  // Se guarda en un ref para leer el valor actual cuando termina la animación
  const readyRef = useRef(ready)
  readyRef.current = ready

  const exit = () => {
    if (exiting.current) return
    exiting.current = true
    onFinish()
  }

  useEffect(() => {
    // La pantalla ya está dibujada con el mismo logo y fondo que el splash nativo
    SplashScreen.hideAsync().catch(() => {})

    // Con tiempos fijos dura lo mismo en todos los celulares (alrededor de 1.5 s)
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
    <Animated.View pointerEvents="none" style={styles.container}>
      <StatusBar style="light" />
      <Animated.Image
        source={logo}
        style={{
          width: LOGO_WIDTH,
          height: LOGO_WIDTH / LOGO_ASPECT_RATIO,
          transform: [
            { scale: spin.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
            { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-135deg'] }) },
          ],
        }}
        resizeMode="contain"
        accessibilityLabel="Logo de DEVUTEC"
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  // Ocupa toda la pantalla por sí sola: no va encima de otras vistas
  container: {
    flex: 1,
    backgroundColor: '#0E0E0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
