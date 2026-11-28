import { useEffect, useRef } from 'react'
import { AccessibilityInfo, Animated, Easing, Pressable } from 'react-native'
import Svg, { Circle, G, Line, Path } from 'react-native-svg'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]
const SUN = '#f2b33d'
const MOON = '#d7f25c'
const SIZE = 22

// Botón de sol y luna (igual que en la web): el sol gira y se encoge, entra la luna con sus estrellitas.
// Cambia entre claro y oscuro a mano; «Sistema» sigue en Perfil → Apariencia.
export default function ThemeToggle() {
  const { isDark, setPreference } = useTheme()
  const styles = useThemedStyles(createStyles)
  // 0 = sol (claro) · 1 = luna (oscuro)
  const progress = useRef(new Animated.Value(isDark ? 1 : 0)).current
  const twinkle = useRef(new Animated.Value(1)).current

  useEffect(() => {
    let reduce = false
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        reduce = value
      })
      .finally(() => {
        Animated.timing(progress, {
          toValue: isDark ? 1 : 0,
          duration: reduce ? 0 : 550,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }).start()
      })
  }, [isDark, progress])

  // Las estrellitas titilan suave mientras es de noche
  useEffect(() => {
    if (!isDark) return undefined
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 0.35, duration: 1200, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [isDark, twinkle])

  const sunStyle = {
    position: 'absolute',
    opacity: progress.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
    transform: [
      { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) },
    ],
  }
  const moonStyle = {
    position: 'absolute',
    opacity: progress.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-70deg', '0deg'] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
    ],
  }

  return (
    <Pressable
      onPress={() => setPreference(isDark ? 'light' : 'dark')}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={({ pressed }) => [styles.round, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      {/* Sol ámbar con 8 rayos */}
      <Animated.View style={sunStyle}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={5.2} fill={SUN} />
          <G>
            {RAYS.map((angle) => (
              <Line
                key={angle}
                x1={12}
                y1={1.8}
                x2={12}
                y2={4.2}
                stroke={SUN}
                strokeWidth={2}
                strokeLinecap="round"
                transform={`rotate(${angle} 12 12)`}
              />
            ))}
          </G>
        </Svg>
      </Animated.View>
      {/* Medialuna lima (☾) */}
      <Animated.View style={moonStyle}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
          <Path d="M15.5 3.2A9 9 0 1 0 20.8 15.6 7.2 7.2 0 0 1 15.5 3.2Z" fill={MOON} />
        </Svg>
      </Animated.View>
      {/* Estrellitas */}
      <Animated.View style={[moonStyle, { opacity: Animated.multiply(progress, twinkle) }]}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
          <Circle cx={20} cy={5} r={1.1} fill={MOON} />
          <Circle cx={22.4} cy={10} r={0.7} fill={MOON} />
          <Circle cx={16.5} cy={1.6} r={0.6} fill={MOON} />
        </Svg>
      </Animated.View>
    </Pressable>
  )
}

const createStyles = ({ colors }) => ({
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
