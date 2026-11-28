// Reglas de los formularios de autenticación. Son las mismas que valida el backend.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Contraseña fuerte: una mayúscula, una minúscula, un número y un símbolo (cualquier carácter que no sea letra, número ni espacio)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/

export function validateEmail(email) {
  if (!email.trim()) return 'El correo es obligatorio'
  if (!EMAIL_REGEX.test(email.trim())) return 'El correo no tiene un formato válido'
  return null
}

export function validatePassword(password) {
  if (!password) return 'La contraseña es obligatoria'
  if (password.length < 8 || password.length > 100) return 'La contraseña debe tener entre 8 y 100 caracteres'
  if (!PASSWORD_REGEX.test(password)) return 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un símbolo'
  return null
}

// Requisitos de la contraseña que se muestran como chips mientras se escribe
export const PASSWORD_RULES = [
  { label: '8+ caracteres', test: (password) => password.length >= 8 },
  { label: 'Mayúscula', test: (password) => /[A-Z]/.test(password) },
  { label: 'Minúscula', test: (password) => /[a-z]/.test(password) },
  { label: 'Un número', test: (password) => /\d/.test(password) },
  { label: 'Un símbolo', test: (password) => /[^A-Za-z0-9\s]/.test(password) },
]

export function validateLogin({ email, password }) {
  const errors = {}
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  if (!password) errors.password = 'La contraseña es obligatoria'
  return errors
}

// Los estudiantes se registran con su correo universitario: el dominio termina en .edu.pe (igual que el backend)
export const STUDENT_EMAIL_MESSAGE = 'Usa tu correo universitario (el que termina en .edu.pe)'
export function isUniversityEmail(email) {
  const domain = String(email ?? '').trim().toLowerCase().split('@').pop()
  return String(email ?? '').includes('@') && domain.endsWith('.edu.pe') && domain.length > '.edu.pe'.length
}

export function validateRegister({ nombre, email, password, rol, terms }) {
  const errors = {}
  if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  else if (rol === 'FREELANCER' && !isUniversityEmail(email)) errors.email = STUDENT_EMAIL_MESSAGE
  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError
  if (!rol) errors.rol = 'Elige si quieres contratar o trabajar'
  if (!terms) errors.terms = 'Acepta los términos para crear tu cuenta'
  return errors
}
