import { useId } from 'react'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { useTheme } from '../../hooks/useTheme'
import PropTypes from 'prop-types'

// Ancho dividido entre alto del isotipo (viewBox de 664 × 432)
export const LOGO_ASPECT_RATIO = 664 / 432

// Colores del degradado (igual que la web): el claro de las piezas y el oscuro donde se entrelazan.
// En modo claro va en verde hoja (el lima no se lee sobre crema); en oscuro, lima. variant="lime" lo fuerza.
const PALETTES = {
  light: { lime: '#4e8f1c', deep: '#0e3d29' },
  dark: { lime: '#c9f15f', deep: '#1f6f4a' },
}

// Isotipo DU con degradado: la D y la U se oscurecen donde se entrelazan
export default function LogoMark({ width = 48, variant }) {
  const { isDark } = useTheme()
  const { lime, deep } = variant === 'lime' || (variant !== 'ink' && isDark) ? PALETTES.dark : PALETTES.light
  // Cada logo necesita ids propios para sus degradados
  const id = useId().replace(/:/g, '')

  return (
    <Svg width={width} height={width / LOGO_ASPECT_RATIO} viewBox="-8 -8 664 432" accessibilityLabel="Logo de DEVUTEC">
      <Defs>
        <LinearGradient id={`${id}d`} gradientUnits="userSpaceOnUse" x1="330" y1="70" x2="470" y2="250">
          <Stop offset="0" stopColor={lime} />
          <Stop offset="1" stopColor={deep} />
        </LinearGradient>
        <LinearGradient id={`${id}u`} gradientUnits="userSpaceOnUse" x1="180" y1="170" x2="340" y2="340">
          <Stop offset="0" stopColor={deep} />
          <Stop offset="1" stopColor={lime} />
        </LinearGradient>
      </Defs>
      <Path d="M0 0H376L472 96V240H352V120H120V360H0Z" fill={`url(#${id}d)`} stroke={`url(#${id}d)`} strokeWidth={8} strokeLinejoin="round" />
      <Path
        d="M176 176H296V280A16 16 0 0 0 312 296H456A72 72 0 0 0 528 224V120H648V296A120 120 0 0 1 528 416H296A120 120 0 0 1 176 296Z"
        fill={`url(#${id}u)`}
        stroke={`url(#${id}u)`}
        strokeWidth={8}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

LogoMark.propTypes = {
  width: PropTypes.number,
  variant: PropTypes.oneOf(['lime', 'ink']),
}
