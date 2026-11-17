import { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Cuyi from '../brand/Cuyi'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

// Alto de la barra de pestañas sin el borde inferior del teléfono (React Navigation usa 49)
const TAB_BAR_HEIGHT = 49
// En Proyectos el cliente tiene el botón + (56 de alto, a 24 de las pestañas): Cuyi sube para quedar encima
const LIFT_OVER_ADD_BUTTON = 24 + 56 + 12

// Burbuja de Cuyi sobre las pestañas: entra rebotando, flota suavecito y abre el chat de ayuda.
// Se suma el borde inferior del teléfono (la barra de gestos del iPhone), que también agranda las pestañas.
export default function CuyiFab() {
  const router = useRouter()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const { user } = useAuth()
  const enter = useRef(new Animated.Value(0)).current
  const bob = useRef(new Animated.Value(0)).current
  const lift = useRef(new Animated.Value(0)).current
  const overAddButton = pathname === '/projects' && user?.rol === 'CLIENT'

  // Sube o baja suavecito al entrar o salir de la pestaña con el botón +
  useEffect(() => {
    Animated.spring(lift, { toValue: overAddButton ? -LIFT_OVER_ADD_BUTTON : 0, friction: 7, useNativeDriver: true }).start()
  }, [overAddButton, lift])

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, delay: 500, friction: 5, tension: 70, useNativeDriver: true }).start()
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [enter, bob])

  const translateY = Animated.add(
    Animated.add(
      enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
      bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }),
    ),
    lift,
  )

  return (
    <Animated.View style={[styles.wrap, { bottom: TAB_BAR_HEIGHT + insets.bottom + 14, opacity: enter, transform: [{ translateY }, { scale: enter }] }]}>
      <Pressable
        onPress={() => router.push('/ayuda')}
        accessibilityRole="button"
        accessibilityLabel="Abrir el chat de ayuda con Cuyi"
        style={({ pressed }) => [styles.button, { backgroundColor: colors.lime, borderColor: colors.background }, pressed && styles.pressed]}
      >
        <Cuyi anim="saluda" size={40} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16 },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  pressed: { transform: [{ scale: 0.94 }] },
})
