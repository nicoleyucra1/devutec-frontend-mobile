// Comisión de DEVUTEC: la paga el cliente. El presupuesto que escribe el cliente YA la incluye:
// con S/ 880 y 10 %, el estudiante recibe S/ 800 y DEVUTEC S/ 80. Misma cuenta que CommissionCalculator del backend.
export const DEFAULT_COMMISSION_RATE = 0.1

const round = (value) => Math.round(value * 100) / 100

export function splitClientTotal(total, rate = DEFAULT_COMMISSION_RATE) {
  const clientTotal = Number(total) || 0
  const freelancerAmount = round(clientTotal / (1 + rate))
  return { clientTotal: round(clientTotal), freelancerAmount, commission: round(clientTotal - freelancerAmount), rate }
}

// "10 %" para mostrar la tasa
export const formatRate = (rate = DEFAULT_COMMISSION_RATE) => `${Math.round(rate * 100)} %`

// Pago en dos partes (misma regla que PaymentPlanner del backend): 50 % al aceptar y 50 % al aprobar Diseño.
// Etapas 10 / 30 / 40 / 10 % y bolsa de emergencia 10 % aparte, igual que en el contrato.
// El pago 1 cubre Descubrimiento (10 %) + Diseño (30 %) + bolsa de emergencia (10 %); el pago 2, Desarrollo (40 %)
// + Entrega final (10 %). Se parten los totales para que los dos pagos sumen exacto, al céntimo.
export const DEFAULT_INSTALLMENTS = [
  { number: 1, percent: 50, dueAt: 'Al aceptar la propuesta', covers: ['Descubrimiento (10 %)', 'Diseño (30 %)', 'Bolsa de emergencia (10 %)'] },
  { number: 2, percent: 50, dueAt: 'Al aprobar la etapa de Diseño, antes de empezar el Desarrollo', covers: ['Desarrollo (40 %)', 'Entrega final (10 %)'] },
]

export function splitInstallments({ clientTotal, freelancerAmount }, installments = DEFAULT_INSTALLMENTS) {
  const client1 = round(clientTotal / 2)
  const freelancer1 = round(freelancerAmount / 2)
  const amounts = [
    { clientAmount: client1, freelancerAmount: freelancer1 },
    { clientAmount: round(clientTotal - client1), freelancerAmount: round(freelancerAmount - freelancer1) },
  ]
  return installments.map((installment, index) => ({ ...installment, ...amounts[index] }))
}
