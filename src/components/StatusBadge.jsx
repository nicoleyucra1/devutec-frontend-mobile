import { Text, View } from 'react-native'
import { useTheme, useThemedStyles } from '../hooks/useTheme'
import PropTypes from 'prop-types'
import { statusShape } from '../utils/propShapes'

// Colores de cada tono, tomados de la paleta del tema para que cambien con el modo claro u oscuro
function toneColors(colors, tone) {
  switch (tone) {
    case 'pending':
      return { color: colors.pending, backgroundColor: colors.pendingLight }
    case 'success':
      return { color: colors.accent, backgroundColor: colors.accentLight }
    case 'danger':
      return { color: colors.error, backgroundColor: colors.errorLight }
    case 'progress':
      return { color: colors.progress, backgroundColor: colors.progressLight }
    default:
      return { color: colors.muted, backgroundColor: colors.primaryLight }
  }
}

// Etiqueta de color con un punto delante, como en el diseño. status viene de src/utils/status.js ({ label, tone })
export default function StatusBadge({ status, fallback }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const { color, backgroundColor } = toneColors(colors, status?.tone)
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{status?.label ?? fallback}</Text>
    </View>
  )
}

const createStyles = ({ fonts }) => ({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontFamily: fonts.semibold },
})

StatusBadge.propTypes = {
  status: statusShape,
  fallback: PropTypes.string,
}
