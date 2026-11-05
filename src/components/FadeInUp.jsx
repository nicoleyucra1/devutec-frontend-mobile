import { useContext, useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import { IntroContext } from '../contexts/introContext'

// Muestra a sus hijos subiendo un poco y apareciendo. Espera a que termine la animación de entrada
// de la app, así no se anima escondido detrás. Con distintos `delay` se logra un efecto en cascada.
export default function FadeInUp({ delay = 0, distance = 18, style, children }) {
  const revealed = useContext(IntroContext)
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!revealed) return
    Animated.timing(progress, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [revealed, delay, progress])

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}
