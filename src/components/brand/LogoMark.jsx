import { Image } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

// Ancho dividido entre alto de logo-mark.png
export const LOGO_ASPECT_RATIO = 800 / 566

// Isotipo DU. En modo claro se usa la versión tinta y en oscuro la lima, salvo que se pida una
export default function LogoMark({ width = 48, variant }) {
  const { isDark } = useTheme()
  const useLime = variant ? variant === 'lime' : isDark
  return (
    <Image
      source={useLime ? require('../../../assets/images/logo-mark.png') : require('../../../assets/images/logo-mark-ink.png')}
      style={{ width, height: width / LOGO_ASPECT_RATIO }}
      resizeMode="contain"
      accessibilityLabel="Logo de DEVUTEC"
    />
  )
}
