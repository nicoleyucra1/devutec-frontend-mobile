import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import AuthLayout from '../../src/components/AuthLayout'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import { useAuth } from '../../src/hooks/useAuth'
import { errorMessage } from '../../src/utils/errorMessage'
import { validateRegister } from '../../src/utils/validation'
import { colors } from '../../src/theme'

const ROLES = [
  { value: 'CLIENT', title: 'Quiero contratar', description: 'Publico proyectos' },
  { value: 'FREELANCER', title: 'Quiero trabajar', description: 'Postulo a proyectos' },
]

const INITIAL_VALUES = { nombre: '', email: '', password: '', confirmPassword: '', rol: '' }

export default function RegisterScreen() {
  const { register } = useAuth()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (name, value) => {
    const next = { ...values, [name]: value }
    setValues(next)
    if (submitted) setErrors(validateRegister(next))
  }

  const handleSubmit = async () => {
    setSubmitted(true)
    setSubmitError(null)

    const validationErrors = validateRegister(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      // El registro devuelve tokens, así que entra directo a las pestañas
      await register({
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
        rol: values.rol,
      })
    } catch (error) {
      setSubmitError(error.response?.status === 409 ? 'Ya existe una cuenta con ese correo' : errorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete a DevUTEC en menos de un minuto">
      <Text style={styles.label}>¿Qué quieres hacer?</Text>
      <View style={styles.roles}>
        {ROLES.map((role) => {
          const selected = values.rol === role.value
          return (
            <Pressable
              key={role.value}
              onPress={() => handleChange('rol', role.value)}
              style={[styles.role, selected && styles.roleSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.muted}>{role.description}</Text>
            </Pressable>
          )
        })}
      </View>
      {errors.rol ? <Text style={styles.error}>{errors.rol}</Text> : null}

      <FormField
        label="Nombre completo"
        value={values.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
        error={errors.nombre}
        autoComplete="name"
      />
      <FormField
        label="Correo"
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormField
        label="Contraseña"
        value={values.password}
        onChangeText={(text) => handleChange('password', text)}
        error={errors.password}
        placeholder="Mínimo 8 caracteres, con letras y números"
        secureTextEntry
        autoComplete="new-password"
      />
      <FormField
        label="Repite la contraseña"
        value={values.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
        error={errors.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
      />

      {submitError ? <Text style={styles.alert}>{submitError}</Text> : null}

      <PrimaryButton title="Crear cuenta" onPress={handleSubmit} loading={submitting} />

      <View style={styles.footer}>
        <Text style={styles.muted}>¿Ya tienes cuenta? </Text>
        <Link href="/login" style={styles.link}>
          Inicia sesión
        </Link>
      </View>
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 6 },
  roles: { marginBottom: 16, flexDirection: 'row', gap: 12 },
  role: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.white,
  },
  roleSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleTitle: { fontWeight: '600', color: colors.text },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
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
