import { useEffect, useMemo, useState } from 'react'
import { AccessibilityInfo, View } from 'react-native'

// Cuyi, la mascota: pixel art de 16 × 16 con cinco animaciones (del sistema de diseño de Ari).
//   saluda     → bienvenida, login y registro
//   escribe    → cargas largas y "enviando"
//   celebra    → pago liberado, propuesta enviada o aceptada
//   duerme     → sin conexión y tiempo agotado
//   confundido → 404 y errores
// K tinta · A café · P crema · G verde · L lima · . vacío
const PALETTE = { '.': 'transparent', K: '#0E0E0C', L: '#D7F25C', G: '#1F6F4A', P: '#F5F3EE', A: '#B7791F', W: '#FFFFFF' }

const grid = (rows) => rows.map((row) => row.split(''))

// Mueve todo el dibujo dx columnas y dy filas
function shift(g, dx, dy) {
  const out = Array.from({ length: 16 }, () => Array(16).fill('.'))
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const nr = r + dy
      const nc = c + dx
      if (nr >= 0 && nr < 16 && nc >= 0 && nc < 16) out[nr][nc] = g[r][c]
    }
  }
  return out
}

// Copia el dibujo y le pinta encima cada lista de píxeles [fila, columna, color]
function put(g, ...layers) {
  const out = g.map((row) => row.slice())
  layers.forEach((layer) => layer.forEach(([r, c, color]) => (out[r][c] = color)))
  return out
}

function buildAnimations() {
  const laptop = grid([
    '................',
    '................',
    '....KK....KK....',
    '...KKKKKKKKKK...',
    '..KAAAAPPAAAAK..',
    '.KAAAAAPPAAAAAK.',
    '.KAAKAAPPAAKAAK.',
    '.KAAAAPPPPAAAAK.',
    '.KAAAAPKKPAAAAK.',
    '.KAAAAAPPAAAAAK.',
    '.KAKKKKKKKKKKAK.',
    '.KAKKKKLLKKKKAK.',
    '.KAKKKKKKKKKKAK.',
    '..GGGGGGGGGGGG..',
    '...KK......KK...',
    '................',
  ])
  const body = grid([
    '................',
    '................',
    '....KK....KK....',
    '...KKKKKKKKKK...',
    '..KAAAAPPAAAAK..',
    '.KAAAAAPPAAAAAK.',
    '.KAAKAAPPAAKAAK.',
    '.KAAAAPPPPAAAAK.',
    '.KAAAAPKKPAAAAK.',
    '.KAAAAAPPAAAAAK.',
    '.KAAAAPPPPAAAAK.',
    '.KAAAPPPPPPAAAK.',
    '..KAAPPPPPPAAK..',
    '...KKKKKKKKKK...',
    '...KK......KK...',
    '................',
  ])
  const left = shift(body, -1, 0)
  const jumped = shift(body, 0, -1)
  const happyL = [[6, 3, 'A'], [6, 10, 'A'], [5, 3, 'K'], [6, 2, 'K'], [6, 4, 'K'], [5, 10, 'K'], [6, 9, 'K'], [6, 11, 'K']]
  const armLow = [[7, 14, 'K'], [8, 14, 'A'], [8, 15, 'K'], [9, 14, 'A'], [9, 15, 'K'], [10, 14, 'K']]
  const armUp = [[3, 14, 'K'], [3, 15, 'K'], [4, 14, 'A'], [4, 15, 'K'], [5, 14, 'A'], [5, 15, 'K'], [6, 14, 'A'], [6, 15, 'K'], [7, 14, 'K']]
  const armUp2 = [[2, 15, 'K'], [3, 14, 'K'], [3, 15, 'A'], [4, 14, 'A'], [4, 15, 'K'], [5, 14, 'A'], [5, 15, 'K'], [6, 14, 'K']]
  const pawL = [[10, 5, 'P'], [10, 6, 'P']]
  const pawR = [[10, 9, 'P'], [10, 10, 'P']]
  const blink = [[6, 4, 'A'], [6, 11, 'A'], [7, 4, 'K'], [7, 5, 'K'], [7, 10, 'K'], [7, 11, 'K']]
  const happy = [[6, 4, 'A'], [6, 11, 'A'], [5, 4, 'K'], [6, 3, 'K'], [6, 5, 'K'], [5, 11, 'K'], [6, 10, 'K'], [6, 12, 'K']]
  const smile = [[9, 6, 'K'], [9, 9, 'K'], [10, 7, 'K'], [10, 8, 'K']]
  const happyJ = [[5, 4, 'A'], [5, 11, 'A'], [4, 4, 'K'], [5, 3, 'K'], [5, 5, 'K'], [4, 11, 'K'], [5, 10, 'K'], [5, 12, 'K']]
  const smileJ = [[8, 6, 'K'], [8, 9, 'K'], [9, 7, 'K'], [9, 8, 'K']]
  const armsJ = [[2, 0, 'K'], [3, 0, 'A'], [4, 0, 'A'], [2, 15, 'K'], [3, 15, 'A'], [4, 15, 'A']]
  const arms = [[3, 0, 'K'], [4, 0, 'A'], [5, 0, 'A'], [3, 15, 'K'], [4, 15, 'A'], [5, 15, 'A']]
  const dim = [[11, 7, 'G'], [11, 8, 'G']]
  const zBig = [[0, 13, 'K'], [0, 14, 'K'], [0, 15, 'K'], [1, 14, 'K'], [2, 13, 'K'], [2, 14, 'K'], [2, 15, 'K']]
  const question = [[0, 13, 'K'], [0, 14, 'K'], [1, 15, 'K'], [2, 14, 'K'], [4, 14, 'K']]
  const lookUp = [[6, 4, 'A'], [6, 11, 'A'], [5, 4, 'K'], [5, 11, 'K']]
  const wavy = [[9, 6, 'K'], [10, 7, 'K'], [9, 8, 'K'], [10, 9, 'K']]

  // ms: tiempo de cada cuadro · seq: orden en que se muestran los cuadros
  return {
    saluda: {
      ms: 260,
      seq: [0, 1, 2, 1],
      label: 'Cuyi saluda con la pata',
      frames: [put(left, armLow), put(left, armUp, happyL), put(left, armUp2, happyL)],
    },
    escribe: {
      ms: 170,
      seq: [0, 1, 2, 3],
      label: 'Cuyi escribe en su laptop',
      frames: [put(laptop, pawL, [[1, 14, 'K']]), put(laptop, pawR, [[0, 15, 'K'], [2, 13, 'K']]), put(laptop, pawL), put(laptop, pawR, blink)],
    },
    celebra: {
      ms: 240,
      seq: [0, 1, 2, 1],
      label: 'Cuyi celebra con los brazos arriba',
      frames: [
        put(body, smile),
        put(jumped, armsJ, happyJ, smileJ, [[0, 2, 'G'], [0, 6, 'P'], [0, 9, 'K'], [1, 13, 'G']]),
        put(body, arms, happy, smile, [[1, 2, 'P'], [0, 7, 'G'], [1, 12, 'K'], [0, 14, 'P']]),
      ],
    },
    duerme: {
      ms: 650,
      seq: [0, 1, 2],
      label: 'Cuyi duerme sobre su laptop',
      frames: [put(laptop, blink, dim, [[2, 14, 'K']]), put(laptop, blink, [[1, 14, 'K'], [2, 15, 'K']]), put(laptop, blink, dim, zBig)],
    },
    confundido: {
      ms: 420,
      seq: [0, 1, 0, 2],
      label: 'Cuyi confundido con un signo de pregunta',
      frames: [put(body, question), put(body, question, lookUp), put(body, lookUp, wavy)],
    },
  }
}

const ANIMATIONS = buildAnimations()

// size: lado total en px. Si el celular tiene activado "reducir movimiento", se muestra el primer cuadro quieto.
export default function Cuyi({ anim = 'saluda', size = 128 }) {
  const animation = ANIMATIONS[anim] ?? ANIMATIONS.saluda
  const [step, setStep] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setStep(0)
    if (reduceMotion) return undefined
    const timer = setInterval(() => setStep((s) => (s + 1) % animation.seq.length), animation.ms)
    return () => clearInterval(timer)
  }, [animation, reduceMotion])

  const frame = animation.frames[animation.seq[step % animation.seq.length]]
  const cell = size / 16

  // Se dibuja fila por fila; las celdas vacías no pintan nada
  const rows = useMemo(
    () =>
      frame.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((key, c) => (
            <View key={c} style={{ width: cell, height: cell, backgroundColor: PALETTE[key] ?? 'transparent' }} />
          ))}
        </View>
      )),
    [frame, cell],
  )

  return (
    <View accessibilityRole="image" accessibilityLabel={animation.label}>
      {rows}
    </View>
  )
}
