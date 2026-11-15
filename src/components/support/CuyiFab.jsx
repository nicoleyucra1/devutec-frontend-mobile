import { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import Cuyi from '../brand/Cuyi'
import { useTheme } from '../../hooks/useTheme'

// Burbuja de Cuyi sobre las pestañas: entra rebotando, flota suavecito y abre el chat de ayuda
export default function CuyiFab() {
  const router = useRouter()
  const { colors } = useTheme()
  const enter = useRef(new Animated.Value(0)).current
  const bob = useRef(new Animated.Value(0)).current

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
    enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
    bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }),
  )

  return (
    <Animated.View style={[styles.wrap, { opacity: enter, transform: [{ translateY }, { scale: enter }] }]}>
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
  wrap: { position: 'absolute', right: 16, bottom: 72 },
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
