import { useEffect, useRef } from 'react'
import { Animated, Easing, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Cuyi from '../brand/Cuyi'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'

const WIDTH = 300
const NODE = 72
// Centro horizontal de cada punto: cliente, garantía y developer
const CLIENT_X = NODE / 2
const ESCROW_X = WIDTH / 2
const DEV_X = WIDTH - NODE / 2
const COIN = 26

// Cómo funciona DEVUTEC en una animación: la moneda sale del cliente, se queda en la garantía
// (el escudo late) y cuando se aprueba la entrega llega al developer. Se repite sin parar.
export default function PaymentFlow() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const coinX = useRef(new Animated.Value(CLIENT_X - COIN / 2)).current
  const coinOpacity = useRef(new Animated.Value(0)).current
  const shield = useRef(new Animated.Value(0)).current
  const dev = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const move = (centerX) =>
      Animated.timing(coinX, { toValue: centerX - COIN / 2, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
    const pulse = (value) =>
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(coinX, { toValue: CLIENT_X - COIN / 2, duration: 0, useNativeDriver: true }),
        Animated.timing(coinOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        move(ESCROW_X),
        // El pago queda retenido en la garantía
        pulse(shield),
        Animated.delay(500),
        move(DEV_X),
        // Llega al developer y se libera
        Animated.parallel([pulse(dev), Animated.timing(coinOpacity, { toValue: 0, duration: 450, useNativeDriver: true })]),
        Animated.delay(700),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [coinX, coinOpacity, shield, dev])

  const pop = (value) => ({ transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] })

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Línea punteada que une a los tres */}
        <View style={styles.line} />

        <View style={styles.node}>
          <View style={[styles.circle, styles.client]}>
            <Ionicons name="storefront-outline" size={28} color={colors.text} />
          </View>
        </View>

        <Animated.View style={[styles.node, pop(shield)]}>
          <View style={[styles.circle, styles.escrow]}>
            <Ionicons name="shield-checkmark" size={28} color={colors.lime} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.node, pop(dev)]}>
          <View style={[styles.circle, styles.dev]}>
            <Cuyi size={44} />
          </View>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.coin, { opacity: coinOpacity, transform: [{ translateX: coinX }] }]}>
          <Text style={styles.coinText}>S/</Text>
        </Animated.View>
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.label}>Garantía</Text>
        <Text style={styles.label}>Developer</Text>
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  container: { width: WIDTH, alignSelf: 'center' },
  row: { width: WIDTH, height: NODE, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  line: {
    position: 'absolute',
    left: CLIENT_X,
    right: WIDTH - DEV_X,
    top: NODE / 2,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.inputBorder,
  },
  node: { width: NODE, height: NODE, alignItems: 'center', justifyContent: 'center' },
  circle: { width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  client: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  escrow: { backgroundColor: colors.escrow },
  dev: { backgroundColor: colors.lime },
  coin: {
    position: 'absolute',
    left: 0,
    top: NODE / 2 - COIN / 2,
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: { fontFamily: fonts.extrabold, fontSize: 10, color: colors.ink },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  label: { width: NODE, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
})
