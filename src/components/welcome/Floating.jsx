import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'

// Hace flotar a sus hijos arriba y abajo sin parar. Con `duration` distinta en cada uno
// no se mueven sincronizados y se ve más natural.
export default function Floating({ duration = 2400, distance = 8, style, children }) {
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
        { position: 'absolute' },
        style,
        { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  )
}
