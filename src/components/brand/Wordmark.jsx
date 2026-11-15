import { Text } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import PropTypes from 'prop-types'

// El nombre de la marca en texto: DEVUTEC
export default function Wordmark({ size = 18, color }) {
  const { colors, fonts } = useTheme()
  return (
    <Text style={{ fontFamily: fonts.extrabold, fontSize: size, color: color ?? colors.text, letterSpacing: size * 0.04 }}>
      DEVUTEC
    </Text>
  )
}

Wordmark.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
}
