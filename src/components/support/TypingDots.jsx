import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

// Tres puntitos que saltan mientras Cuyi escribe
export default function TypingDots() {
  const { colors } = useTheme()
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current

  useEffect(() => {
    const loops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - index) * 150 + 200),
        ]),
      ),
    )
    loops.forEach((loop) => loop.start())
    return () => loops.forEach((loop) => loop.stop())
  }, [dots])

  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 6 }} accessibilityLabel="Cuyi está escribiendo">
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.muted,
            opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
          }}
        />
      ))}
    </View>
  )
}
