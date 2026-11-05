import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import Wordmark from './brand/Wordmark'
import { LOGO_ASPECT_RATIO } from './brand/LogoMark'

// Mismo tamaño y color de fondo que el splash nativo (app.json), así el cambio no se nota
const LOGO_WIDTH = 96
const LOGO_TEXT_GAP = 16
const logo = require('../../assets/images/logo-mark.png')

// Animación de entrada en tres fases:
// 1. Sobre negro, el logo crece y gira -135° y vuelve con rebote a su lugar.
// 2. El logo se corre a la izquierda y "DEV U TEC" sale desde detrás de él hasta quedar el conjunto centrado.
// 3. Mientras tanto el negro se funde en un degradado verde escrow. Al final la pantalla sube como una cortina.
// No termina hasta que `ready` sea true (por ejemplo, cuando ya se leyó la sesión guardada).
// onReveal avisa cuando la cortina empieza a subir; onFinish, cuando ya no se ve.
export default function AnimatedSplash({ ready, onReveal, onFinish }) {
  const { height } = useWindowDimensions()
  // Ancho real del texto, medido antes de animar
  const [textWidth, setTextWidth] = useState(0)

  const spin = useRef(new Animated.Value(0)).current
  const reveal = useRef(new Animated.Value(0)).current
  const background = useRef(new Animated.Value(0)).current
  const curtain = useRef(new Animated.Value(0)).current
  const started = useRef(false)
  const introDone = useRef(false)
  const exiting = useRef(false)
  // Se guarda en un ref para leer el valor actual cuando termina la animación
  const readyRef = useRef(ready)
  readyRef.current = ready

  const exit = () => {
    if (exiting.current) return
    exiting.current = true
    onReveal?.()
    Animated.timing(curtain, {
      toValue: 1,
      duration: 550,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onFinish())
  }

  useEffect(() => {
    // La pantalla ya está dibujada con el mismo logo y fondo que el splash nativo
    SplashScreen.hideAsync().catch(() => {})
  }, [])

  useEffect(() => {
    if (!textWidth || started.current) return
    started.current = true

    Animated.sequence([
      // Fase 1: giro y rebote (spin va de 0 a 1 y vuelve a 0 con efecto de resorte)
      Animated.timing(spin, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(spin, { toValue: 0, duration: 520, easing: Easing.out(Easing.back(2.2)), useNativeDriver: true }),
      // Fases 2 y 3: se abre espacio para el texto mientras el fondo pasa a morado
      Animated.parallel([
        // El ancho de la máscara es una propiedad de layout: no puede ir con el driver nativo
        Animated.timing(reveal, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(background, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.delay(450),
    ]).start(() => {
      introDone.current = true
      if (readyRef.current) exit()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textWidth])

  // Si la sesión termina de cargar después de la animación, se sale en ese momento
  useEffect(() => {
    if (ready && introDone.current) exit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  const logoStyle = {
    width: LOGO_WIDTH,
    height: LOGO_WIDTH / LOGO_ASPECT_RATIO,
    transform: [
      { scale: spin.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
      { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-135deg'] }) },
    ],
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY: curtain.interpolate({ inputRange: [0, 1], outputRange: [0, -height] }) }] }]}
    >
      <StatusBar style="light" />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: background }]}>
        <LinearGradient colors={['#1F6F4A', '#14472F', '#0E0E0C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* La fila [logo + máscara] se centra sola: al crecer la máscara, el logo se corre a la izquierda */}
      <View style={styles.row}>
        <Animated.Image source={logo} style={logoStyle} resizeMode="contain" accessibilityLabel="Logo de DEV U TEC" />
        <Animated.View
          style={[
            styles.mask,
            { width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, textWidth + LOGO_TEXT_GAP] }) },
          ]}
        >
          {/* El texto empieza escondido detrás del logo y se desliza hacia la derecha */}
          <Animated.View
            style={{ transform: [{ translateX: reveal.interpolate({ inputRange: [0, 1], outputRange: [-textWidth, 0] }) }] }}
          >
            <Wordmark size={30} color="#F5F3EE" />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Copia invisible para medir cuánto mide el nombre */}
      <View style={styles.measure} onLayout={(event) => setTextWidth(Math.ceil(event.nativeEvent.layout.width))}>
        <Wordmark size={30} color="#F5F3EE" />
      </View>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  mask: { overflow: 'hidden', alignItems: 'flex-end' },
  measure: { position: 'absolute', opacity: 0 },
})
