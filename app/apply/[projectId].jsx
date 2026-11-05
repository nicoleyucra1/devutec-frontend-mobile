import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenState from '../../src/components/ScreenState'
import { useAsync } from '../../src/hooks/useAsync'
import api from '../../src/services/api'
import { applicationService } from '../../src/services/applicationService'
import { errorMessage } from '../../src/utils/errorMessage'
import { formatMoney } from '../../src/utils/format'
import { colors } from '../../src/theme'

// Mismas reglas que ApplicationRequestDTO en el backend
function validate({ message, proposedPrice }) {
  const errors = {}
  const length = message.trim().length
  if (length < 20) errors.message = 'Cuéntale al cliente un poco más (mínimo 20 caracteres)'
  if (length > 2000) errors.message = 'El mensaje no puede pasar de 2000 caracteres'
  if (!proposedPrice || Number(proposedPrice) <= 0) errors.proposedPrice = 'Ingresa un precio mayor que 0'
  return errors
}

// Se abre desde el detalle de un proyecto con router.push(`/apply/${project.id}`)
export default function ApplyScreen() {
  const { projectId } = useLocalSearchParams()
  const { data: project, loading, error, reload } = useAsync(
    ({ signal }) => api.get(`/projects/${projectId}`, { signal }).then((res) => res.data),
    [projectId],
  )

  const [values, setValues] = useState({ message: '', proposedPrice: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitError(null)
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await applicationService.apply({
        projectId: Number(projectId),
        message: values.message.trim(),
        proposedPrice: Number(values.proposedPrice.replace(',', '.')),
      })
      router.replace('/applications')
    } catch (err) {
      setSubmitError(errorMessage(err))
      setSubmitting(false)
    }
  }

  if (loading || error) return <ScreenState loading={loading} error={error} onRetry={reload} />

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.muted}>Presupuesto del cliente: {formatMoney(project.budget)}</Text>

        <FormField
          label="Tu propuesta"
          multiline
          numberOfLines={6}
          style={styles.textarea}
          placeholder="Explica cómo harías el proyecto y por qué eres buena opción"
          value={values.message}
          onChangeText={(message) => setValues({ ...values, message })}
          error={errors.message}
        />
        <Text style={styles.counter}>{values.message.trim().length}/2000</Text>

        <FormField
          label="Tu precio (S/)"
          keyboardType="decimal-pad"
          value={values.proposedPrice}
          onChangeText={(proposedPrice) => setValues({ ...values, proposedPrice })}
          error={errors.proposedPrice}
        />

        {submitError && <Text style={styles.error}>{submitError}</Text>}

        <PrimaryButton title="Enviar postulación" loading={submitting} onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  counter: { alignSelf: 'flex-end', color: colors.muted, fontSize: 12, marginTop: -12, marginBottom: 8 },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8 },
})