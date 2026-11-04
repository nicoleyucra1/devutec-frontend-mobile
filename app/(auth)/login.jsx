import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import AuthLayout from '../../src/components/AuthLayout'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import { useAuth } from '../../src/hooks/useAuth'
import { errorMessage } from '../../src/utils/errorMessage'
import { validateLogin } from '../../src/utils/validation'
import { colors } from '../../src/theme'

export default function LoginScreen() {
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (name, value) => {
    const next = { ...values, [name]: value }
    setValues(next)
    // Después del primer intento, los errores se actualizan mientras se escribe
    if (submitted) setErrors(validateLogin(next))
  }

  const handleSubmit = async () => {
    setSubmitted(true)
    setSubmitError(null)

    const validationErrors = validateLogin(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      // Al haber sesión, el layout raíz cambia solo a las pestañas
      await login({ email: values.email.trim(), password: values.password })
    } catch (error) {
      setSubmitError(error.response?.status === 401 ? 'Correo o contraseña incorrectos' : errorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Entra para ver proyectos y postulaciones">
      <FormField
        label="Correo"
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormField
        label="Contraseña"
        value={values.password}
        onChangeText={(text) => handleChange('password', text)}
        error={errors.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
      />

      {submitError ? <Text style={styles.alert}>{submitError}</Text> : null}

      <PrimaryButton title="Entrar" onPress={handleSubmit} loading={submitting} />

      <View style={styles.footer}>
        <Text style={styles.muted}>¿No tienes cuenta? </Text>
        <Link href="/register" style={styles.link}>
          Regístrate
        </Link>
      </View>
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '600' },
})
