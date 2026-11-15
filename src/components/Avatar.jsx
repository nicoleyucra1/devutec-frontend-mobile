import { useState } from 'react'
import { Image, Text, View } from 'react-native'
import { useThemedStyles } from '../hooks/useTheme'
import { avatarSrc } from '../utils/avatar'
import PropTypes from 'prop-types'
import { styleType } from '../utils/propShapes'

// Iniciales para cuando no hay foto ("CR" para Camila Ríos)
export function initials(name) {
  return (name ?? '?')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// Foto de perfil de una persona; si no tiene (o no carga), un círculo verde con sus iniciales.
// src es la avatarUrl que manda el backend o la ruta de una foto recién elegida.
// fallbackStyle y textStyle cambian el círculo de las iniciales (por ejemplo, lima en la tarjeta oscura).
export default function Avatar({ name, src, size = 48, style, fallbackStyle, textStyle }) {
  const styles = useThemedStyles(createStyles)
  const uri = avatarSrc(src)
  // Se recuerda qué foto falló: si llega una nueva, se vuelve a intentar
  const [failedUri, setFailedUri] = useState(null)
  const circle = { width: size, height: size, borderRadius: size / 2 }

  if (uri && uri !== failedUri) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailedUri(uri)}
        style={[styles.image, circle, style]}
        accessibilityIgnoresInvertColors
      />
    )
  }

  return (
    <View style={[styles.fallback, circle, fallbackStyle, style]}>
      <Text style={[styles.text, { fontSize: Math.round(size / 3) }, textStyle]}>{initials(name)}</Text>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  image: { backgroundColor: colors.primaryLight },
  fallback: { backgroundColor: colors.escrow, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.bold, color: '#FFFFFF' },
})

Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  size: PropTypes.number,
  style: styleType,
  fallbackStyle: styleType,
  textStyle: styleType,
}
