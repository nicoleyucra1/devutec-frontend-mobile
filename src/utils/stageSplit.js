// Reparto del pago por etapas (igual que en la web y el backend). Cada parte del pago queda en 50 %:
// pago 1 = Descubrimiento + Diseño (40 %) + bolsa (10 %) · pago 2 = Desarrollo + Entrega final (50 %).
export const STAGE_NAMES = ['Descubrimiento', 'Diseño', 'Desarrollo', 'Entrega final']
export const STANDARD_SPLIT = [10, 30, 40, 10]
export const PART_TOTALS = [40, 50]
export const MIN_STAGE = 5

export function isStandardSplit(split) {
  return !Array.isArray(split) || split.every((value, index) => value === STANDARD_SPLIT[index])
}

// Sube o baja una etapa de 5 en 5; la otra etapa de la misma parte se ajusta para que la parte sume lo mismo
export function stepSplit(split, index, delta) {
  const part = index < 2 ? 0 : 1
  const total = PART_TOTALS[part]
  const value = Math.max(MIN_STAGE, Math.min(total - MIN_STAGE, split[index] + delta))
  const next = [...split]
  next[index] = value
  next[index % 2 === 0 ? index + 1 : index - 1] = total - value
  return next
}
