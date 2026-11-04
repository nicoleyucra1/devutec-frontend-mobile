// Reglas de los formularios de autenticación. Son las mismas que valida el backend.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/

export function validateEmail(email) {
  if (!email.trim()) return 'El correo es obligatorio'
  if (!EMAIL_REGEX.test(email.trim())) return 'El correo no tiene un formato válido'
  return null
}

export function validatePassword(password) {
  if (!password) return 'La contraseña es obligatoria'
  if (password.length < 8 || password.length > 100) return 'La contraseña debe tener entre 8 y 100 caracteres'
  if (!PASSWORD_REGEX.test(password)) return 'La contraseña debe tener al menos una letra y un número'
  return null
}

export function validateLogin({ email, password }) {
  const errors = {}
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  if (!password) errors.password = 'La contraseña es obligatoria'
  return errors
}

export function validateRegister({ nombre, email, password, confirmPassword, rol }) {
  const errors = {}
  if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError
  if (confirmPassword !== password) errors.confirmPassword = 'Las contraseñas no coinciden'
  if (!rol) errors.rol = 'Elige si quieres contratar o trabajar'
  return errors
}
