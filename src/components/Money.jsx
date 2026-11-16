import { Text } from 'react-native'
import PropTypes from 'prop-types'
import { formatBudget } from '../utils/format'
import { styleType } from '../utils/propShapes'

// Monto grande del diseño: "S/ 1,800" fuerte y los centavos ".00" en gris
export default function Money({ value, style, centsStyle }) {
  const text = formatBudget(value)
  const dot = text.lastIndexOf('.')
  if (dot === -1) return <Text style={style}>{text}</Text>
  return (
    <Text style={style}>
      {text.slice(0, dot)}
      <Text style={centsStyle}>{text.slice(dot)}</Text>
    </Text>
  )
}

Money.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: styleType,
  centsStyle: styleType,
}
