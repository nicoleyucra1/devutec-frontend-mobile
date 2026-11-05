import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import SkillChips from '../../src/components/projects/SkillChips'
import StateView from '../../src/components/projects/StateView'
import { colors } from '../../src/theme'
import { useProjectActions } from '../../src/hooks/useProjectActions'
import { useAuth } from '../../src/hooks/useAuth'
import { useSkills } from '../../src/hooks/useSkills'
import { detectDistrict } from '../../src/utils/location'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function validate(values) {
  const errors = {}
  if (!values.title.trim()) errors.title = 'El título es obligatorio'
  if (!values.budget.trim()) errors.budget = 'El presupuesto es obligatorio'
  else if (!(Number(values.budget.replace(',', '.')) > 0)) errors.budget = 'El presupuesto debe ser mayor a cero'
  if (values.deadline) {
    const date = new Date(`${values.deadline}T00:00:00`)
    if (!DATE_PATTERN.test(values.deadline) || Number.isNaN(date.getTime())) errors.deadline = 'Usa el formato AAAA-MM-DD'
    else if (date < new Date(new Date().toDateString())) errors.deadline = 'La fecha no puede ser pasada'
  }
  if (values.location.length > 100) errors.location = 'Máximo 100 caracteres'
  return errors
}

function Field({ label, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

// Publicar proyecto. Al abrir la pantalla se detecta el distrito con el GPS para llenar la ubicación.
export default function NewProjectScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const skills = useSkills()
  const actions = useProjectActions()
  const [values, setValues] = useState({ title: '', description: '', budget: '', deadline: '', location: '', skillIds: [] })
  const [errors, setErrors] = useState({})
  const [gps, setGps] = useState({ status: 'idle', message: null })

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const fillLocation = async () => {
    setGps({ status: 'loading', message: null })
    const result = await detectDistrict()
    if (result.district) {
      // Solo se llena si el usuario no escribió nada mientras se buscaba la ubicación
      setValues((prev) => (prev.location ? prev : { ...prev, location: result.district }))
      setGps({ status: 'done', message: 'Ubicación detectada con tu GPS' })
    } else {
      setGps({ status: 'error', message: result.error })
    }
  }

  useEffect(() => {
    fillLocation()
  }, [])

  const toggleSkill = (skillId) =>
    setValues((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId) ? prev.skillIds.filter((s) => s !== skillId) : [...prev.skillIds, skillId],
    }))

  const handleSubmit = async () => {
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    try {
      const created = await actions.create({
        title: values.title.trim(),
        description: values.description.trim() || null,
        budget: Number(values.budget.replace(',', '.')),
        deadline: values.deadline || null,
        location: values.location.trim() || null,
        skillIds: values.skillIds,
      })
      router.replace(`/projects/${created.id}`)
    } catch {
      // El mensaje queda en actions.error
    }
  }

  if (user && user.rol !== 'CLIENT') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Publicar proyecto' }} />
        <StateView title="Solo para clientes" message="Necesitas una cuenta de cliente para publicar proyectos." />
      </>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: true, title: 'Publicar proyecto', headerBackTitle: 'Volver' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Título *" error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={values.title}
            onChangeText={(text) => setField('title', text)}
            placeholderTextColor="#9ca3af"
            placeholder="Ej.: Landing page para mi cafetería"
            maxLength={255}
          />
        </Field>

        <Field label="Descripción">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={values.description}
            onChangeText={(text) => setField('description', text)}
            placeholderTextColor="#9ca3af"
            placeholder="Cuenta qué necesitas"
            multiline
            textAlignVertical="top"
          />
        </Field>

        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label="Presupuesto (S/) *" error={errors.budget}>
              <TextInput
                style={[styles.input, errors.budget && styles.inputError]}
                value={values.budget}
                onChangeText={(text) => setField('budget', text)}
                placeholderTextColor="#9ca3af"
                placeholder="500"
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
          <View style={styles.flex}>
            <Field label="Fecha límite" error={errors.deadline}>
              <TextInput
                style={[styles.input, errors.deadline && styles.inputError]}
                value={values.deadline}
                onChangeText={(text) => setField('deadline', text)}
                placeholderTextColor="#9ca3af"
                placeholder="AAAA-MM-DD"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </Field>
          </View>
        </View>

        <Field label="Ubicación" error={errors.location}>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, styles.flex, errors.location && styles.inputError]}
              value={values.location}
              onChangeText={(text) => setField('location', text)}
              placeholderTextColor="#9ca3af"
              placeholder="Distrito"
              maxLength={100}
            />
            <Pressable
              onPress={fillLocation}
              disabled={gps.status === 'loading'}
              style={styles.gpsButton}
              accessibilityRole="button"
              accessibilityLabel="Usar mi ubicación"
            >
              {gps.status === 'loading' ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Ionicons name="locate" size={22} color={colors.primary} />
              )}
            </Pressable>
          </View>
          {gps.status === 'loading' ? <Text style={styles.hint}>Buscando tu distrito...</Text> : null}
          {gps.message ? <Text style={gps.status === 'error' ? styles.error : styles.hint}>{gps.message}</Text> : null}
        </Field>

        <Field label="Habilidades requeridas">
          {skills.loading ? <ActivityIndicator color={colors.primary} /> : null}
          {skills.error ? <Text style={styles.error}>{skills.error}</Text> : null}
          <SkillChips skills={skills.data} selectedIds={values.skillIds} onToggle={toggleSkill} />
        </Field>

        {actions.error ? <Text style={styles.serverError}>{actions.error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={actions.saving}
          style={({ pressed }) => [styles.submit, (pressed || actions.saving) && styles.submitPressed]}
          accessibilityRole="button"
        >
          {actions.saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Publicar</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, padding: 16, paddingBottom: 40 },
  field: { gap: 6 },
  label: { color: colors.text, fontSize: 14, fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: { borderColor: '#f87171' },
  textarea: { minHeight: 110 },
  row: { flexDirection: 'row', gap: 12 },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  gpsButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  hint: { color: colors.muted, fontSize: 13 },
  error: { color: colors.error, fontSize: 13 },
  serverError: { backgroundColor: colors.errorLight, borderRadius: 8, color: colors.error, padding: 12 },
  submit: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14 },
  submitPressed: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
