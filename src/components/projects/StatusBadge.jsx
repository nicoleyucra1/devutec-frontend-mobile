import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { STATUS_LABELS } from '../../utils/format'
import PropTypes from 'prop-types'

// Abierto en verde, en curso en ámbar y terminado en gris; los tonos cambian con el modo claro u oscuro
const statusColors = (colors) => ({
  OPEN: { backgroundColor: colors.accentLight, color: colors.accent },
  IN_PROGRESS: { backgroundColor: colors.pendingLight, color: colors.pending },
  DONE: { backgroundColor: colors.primaryLight, color: colors.muted },
})

// Estado del proyecto con un punto delante, como en el diseño
export default function StatusBadge({ status }) {
  const { colors, fonts } = useTheme()
  const { backgroundColor, color } = statusColors(colors)[status] ?? statusColors(colors).DONE
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { fontFamily: fonts.semibold, color }]}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12 },
})

StatusBadge.propTypes = {
  status: PropTypes.string,
}
