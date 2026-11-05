import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Ícono en un círculo que flota arriba y abajo sin parar. `duration` distinta en cada uno
// hace que no se muevan sincronizados y se vea más natural.
export default function FloatingIcon({ icon, color, background, size = 52, duration = 2400, style }) {
  const float = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [float, duration])

  return (
    <Animated.View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#312e81',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
})
