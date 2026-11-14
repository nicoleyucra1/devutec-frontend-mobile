import { StyleSheet, Text } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { STATUS_LABELS } from '../../utils/format'

// Abierto en verde, en curso en ámbar y terminado en gris; los tonos cambian con el modo claro u oscuro
const statusColors = (colors) => ({
  OPEN: { backgroundColor: colors.accentLight, color: colors.accent },
  IN_PROGRESS: { backgroundColor: colors.pendingLight, color: colors.pending },
  DONE: { backgroundColor: colors.primaryLight, color: colors.muted },
})

export default function StatusBadge({ status }) {
  const { colors, fonts } = useTheme()
  const palette = statusColors(colors)[status] ?? statusColors(colors).DONE
  return <Text style={[styles.badge, { fontFamily: fonts.semibold }, palette]}>{STATUS_LABELS[status] ?? status}</Text>
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
})
