import { Text } from 'react-native'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

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
      return { color: colors.progress, backgroundColor: colors.primaryLight }
    default:
      return { color: colors.muted, backgroundColor: colors.primaryLight }
  }
}

// Etiqueta de color para un estado. status viene de src/utils/status.js ({ label, tone })
export default function StatusBadge({ status, fallback }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return <Text style={[styles.badge, toneColors(colors, status?.tone)]}>{status?.label ?? fallback}</Text>
}

const createStyles = ({ fonts }) => ({
  badge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontFamily: fonts.semibold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
})