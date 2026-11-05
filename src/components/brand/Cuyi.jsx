import { useEffect, useState } from 'react'
import { View } from 'react-native'

// Cuyi, la mascota: un cuy peruano detrás de su laptop, dibujado en pixel art (14 × 13).
// K tinta · B café · W crema · G verde de la base · L logo lima de la laptop · . vacío
const PIXELS = [
  '...KK....KK...',
  '..KKKKKKKKKK..',
  '.KBBBBWWBBBBK.',
  'KBBBBBWWBBBBBK',
  'KBBEBBWWBBEBBK',
  'KBBBBWWWWBBBBK',
  'KBBBBWKKWBBBBK',
  'KBBBBBWWBBBBBK',
  'KBKKKKKKKKKKBK',
  'KBKKKKLLKKKKBK',
  'KBKKKKKKKKKKBK',
  '.GGGGGGGGGGGG.',
  '..KK......KK..',
]

const COLORS = {
  K: '#0E0E0C',
  B: '#B7791F',
  W: '#F5F3EE',
  G: '#1F6F4A',
  L: '#D7F25C',
}

// E son los ojos: tinta normalmente y café cuando parpadea
export default function Cuyi({ size = 140, blink = true }) {
  const [closed, setClosed] = useState(false)
  const cell = size / PIXELS[0].length

  useEffect(() => {
    if (!blink) return undefined
    let closeTimer
    const interval = setInterval(() => {
      setClosed(true)
      closeTimer = setTimeout(() => setClosed(false), 160)
    }, 3200)
    return () => {
      clearInterval(interval)
      clearTimeout(closeTimer)
    }
  }, [blink])

  return (
    <View accessibilityRole="image" accessibilityLabel="Cuyi, la mascota de DEV U TEC">
      {PIXELS.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.split('').map((key, c) => {
            const color = key === 'E' ? (closed ? COLORS.B : COLORS.K) : COLORS[key]
            return <View key={c} style={{ width: cell, height: cell, backgroundColor: color ?? 'transparent' }} />
          })}
        </View>
      ))}
    </View>
  )
}
