import { Text } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

// El nombre de la marca en texto: DEV U TEC
export default function Wordmark({ size = 18, color }) {
  const { colors, fonts } = useTheme()
  return (
    <Text style={{ fontFamily: fonts.extrabold, fontSize: size, color: color ?? colors.text, letterSpacing: size * 0.04 }}>
      DEV U TEC
    </Text>
  )
}
