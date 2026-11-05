import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AuthLayout from '../src/components/AuthLayout'
import FormField from '../src/components/FormField'
import PrimaryButton from '../src/components/PrimaryButton'
import { useAuth } from '../src/hooks/useAuth'
import { errorMessage } from '../src/utils/errorMessage'
import { PASSWORD_RULES, validateRegister } from '../src/utils/validation'
import { useTheme, useThemedStyles } from '../src/hooks/useTheme'

const ROLES = [
  { value: 'CLIENT', icon: 'storefront-outline', title: 'Soy cliente', description: 'Publico y pago al aprobar.' },
  { value: 'FREELANCER', icon: 'code-slash-outline', title: 'Soy freelancer', description: 'Postulo y cobro seguro.' },
]

// Textos que cambian según el rol elegido
const COPY = {
  CLIENT: { nameLabel: 'Nombre del negocio', namePh: 'Pizzería Don Mario', mailPh: 'tu@negocio.pe', cta: 'Crear cuenta como cliente' },
  FREELANCER: { nameLabel: 'Nombres y apellidos', namePh: 'Camila Ríos', mailPh: 'tu@utec.edu.pe', cta: 'Crear cuenta como freelancer' },
}

const INITIAL_VALUES = { nombre: '', email: '', password: '', rol: 'CLIENT', terms: false }

export default function RegisterScreen() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const { register } = useAuth()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const copy = COPY[values.rol]

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
    <AuthLayout tab="register">
      <View style={styles.roles} accessibilityRole="radiogroup">
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
              <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>
                <Ionicons name={role.icon} size={18} color={selected ? colors.ink : colors.text} />
              </View>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleText}>{role.description}</Text>
            </Pressable>
          )
        })}
      </View>

      <FormField
        label={copy.nameLabel}
        placeholder={copy.namePh}
        value={values.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
        error={errors.nombre}
        autoComplete="name"
      />
      <FormField
        label="Correo electrónico"
        placeholder={copy.mailPh}
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormField
        label="Contraseña"
        placeholder="Crea una contraseña"
        value={values.password}
        onChangeText={(text) => handleChange('password', text)}
        error={submitted ? errors.password : null}
        secureTextEntry
        autoComplete="new-password"
      >
        {/* Requisitos que se van marcando mientras se escribe */}
        <View style={styles.rules}>
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(values.password)
            return (
              <Text key={rule.label} style={[styles.rule, ok && styles.ruleOk]}>
                {ok ? '✓' : '·'} {rule.label}
              </Text>
            )
          })}
        </View>
      </FormField>

      <Pressable
        onPress={() => handleChange('terms', !values.terms)}
        style={styles.terms}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: values.terms }}
      >
        <View style={[styles.checkbox, values.terms && styles.checkboxOn]}>
          {values.terms ? <Ionicons name="checkmark" size={14} color={colors.onPrimary} /> : null}
        </View>
        <Text style={styles.termsText}>
          Acepto los <Text style={styles.termsBold}>Términos y condiciones</Text> y la{' '}
          <Text style={styles.termsBold}>Política de privacidad</Text>.
        </Text>
      </Pressable>
      {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}

      {submitError ? <Text style={styles.alert}>{submitError}</Text> : null}

      <PrimaryButton title={copy.cta} onPress={handleSubmit} loading={submitting} />
    </AuthLayout>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  roles: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  role: {
    flex: 1,
    minHeight: 132,
    gap: 8,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleSelected: { borderWidth: 2, borderColor: colors.text, padding: 15 },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconSelected: { backgroundColor: colors.lime },
  roleTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  roleText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  rule: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    overflow: 'hidden',
  },
  ruleOk: { color: colors.accent, backgroundColor: colors.accentLight },
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  termsBold: { fontFamily: fonts.semibold, color: colors.text },
  error: { fontFamily: fonts.medium, color: colors.error, fontSize: 13, marginTop: 4 },
  alert: {
    fontFamily: fonts.medium,
    backgroundColor: colors.errorLight,
    color: colors.error,
    padding: 12,
    borderRadius: radius.md,
    marginTop: 12,
    overflow: 'hidden',
  },
})
