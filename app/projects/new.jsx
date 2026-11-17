import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
 
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SkillChips from '../../src/components/projects/SkillChips'
import StateView from '../../src/components/projects/StateView'
import { radius } from '../../src/theme'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { useProjectActions } from '../../src/hooks/useProjectActions'
import { useAuth } from '../../src/hooks/useAuth'
import { useSkills } from '../../src/hooks/useSkills'
import { detectDistrict } from '../../src/utils/location'
import PropTypes from 'prop-types'

// Distritos para elegir con un toque; con el GPS se puede llenar cualquier otro
const DISTRICTS = ['Barranco', 'Miraflores', 'San Isidro', 'Surco', 'San Borja', 'Lince', 'Jesús María', 'Pueblo Libre', 'La Molina', 'San Miguel', 'Chorrillos', 'Remoto']

// "15122026" → "15/12/2026" mientras se escribe
function maskDate(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/')
}

// "15/12/2026" → "2026-12-15" (lo que espera el backend), o null si la fecha no existe
function toIsoDate(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) return null
  const [, day, month, year] = match.map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function validate(values) {
  const errors = {}
  if (!values.title.trim()) errors.title = 'El título es obligatorio'
  if (!values.budget.trim()) errors.budget = 'El presupuesto es obligatorio'
  else if (!(Number(values.budget.replace(',', '.')) > 0)) errors.budget = 'El presupuesto debe ser mayor a cero'
  if (values.deadline) {
    const iso = toIsoDate(values.deadline)
    if (!iso) errors.deadline = 'Usa el formato DD/MM/AAAA'
    else if (new Date(`${iso}T00:00:00`) < new Date(new Date().toDateString())) errors.deadline = 'La fecha no puede ser pasada'
  }
  return errors
}

function Field({ label, error, children }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

// Nuevo proyecto (mockup): presupuesto grande arriba, título, fecha, distrito y el botón fijo abajo.
// El distrito es opcional (igual que en la web): se elige con un toque o con el GPS, y el permiso se pide solo
// al tocar "Usar mi ubicación".
export default function NewProjectScreen() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user } = useAuth()
  const skills = useSkills()
  const actions = useProjectActions()
  const [values, setValues] = useState({ title: '', description: '', budget: '', deadline: '', location: '', skillIds: [] })
  const [errors, setErrors] = useState({})
  const [gps, setGps] = useState({ status: 'idle', message: null, denied: false })

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const fillLocation = async () => {
    setGps({ status: 'loading', message: null, denied: false })
    const result = await detectDistrict()
    if (result.district) {
      setField('location', result.district)
      setGps({ status: 'done', message: 'Ubicación detectada con tu GPS', denied: false })
    } else {
      setGps({ status: 'error', message: result.error, denied: Boolean(result.denied) })
    }
  }

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
        deadline: values.deadline ? toIsoDate(values.deadline) : null,
        location: values.location.trim() || null,
        skillIds: values.skillIds,
      })
      router.replace(`/projects/${created.id}`)
    } catch {
      // El mensaje queda en actions.error
    }
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))

  if (user && user.rol !== 'CLIENT') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTransparent: false, title: 'Nuevo proyecto' }} />
        <StateView title="Solo para clientes" message="Necesitas una cuenta de cliente para publicar proyectos." />
      </>
    )
  }

  // Un distrito detectado por GPS que no está en la lista aparece como una opción más, ya elegida
  const districtOptions = values.location && !DISTRICTS.includes(values.location) ? [values.location, ...DISTRICTS] : DISTRICTS

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.round}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Nuevo proyecto</Text>
        <Text style={styles.free}>Gratis</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.budgetCard, errors.budget && styles.budgetCardError]}>
          <Text style={styles.kicker}>PRESUPUESTO</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.currency}>S/</Text>
            <TextInput
              style={styles.budgetInput}
              value={values.budget}
              onChangeText={(text) => setField('budget', text)}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              accessibilityLabel="Presupuesto en soles"
            />
          </View>
          {errors.budget ? (
            <Text style={styles.error}>{errors.budget}</Text>
          ) : (
            <View style={styles.lockRow}>
              <Ionicons name="lock-closed-outline" size={15} color={colors.accent} />
              <Text style={styles.lockText}>Lo retienes solo al elegir una propuesta</Text>
            </View>
          )}
        </View>

        <Field label="Título del proyecto" error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={values.title}
            onChangeText={(text) => setField('title', text)}
            placeholderTextColor={colors.muted}
            placeholder="Ej.: Web para pizzería"
            maxLength={255}
          />
        </Field>

        <Field label="Fecha límite" error={errors.deadline}>
          <View style={[styles.input, styles.dateRow, errors.deadline && styles.inputError]}>
            <TextInput
              style={styles.dateInput}
              value={values.deadline}
              onChangeText={(text) => setField('deadline', maskDate(text))}
              placeholderTextColor={colors.muted}
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
              maxLength={10}
            />
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
          </View>
        </Field>

        <Field label="Distrito (opcional)">
          {gps.denied ? (
            <View style={styles.notice}>
              <View style={styles.noticeIcon}>
                <Ionicons name="location-outline" size={18} color={colors.pending} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.noticeTitle}>Sin acceso a tu ubicación</Text>
                <Text style={styles.noticeText}>Elige el distrito abajo. Puedes activarla en Ajustes › DEVUTEC › Ubicación.</Text>
                <Pressable onPress={() => Linking.openSettings().catch(() => {})} accessibilityRole="button">
                  <Text style={styles.noticeLink}>Abrir Ajustes</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={fillLocation}
              disabled={gps.status === 'loading'}
              accessibilityRole="button"
              style={({ pressed }) => [styles.gps, pressed && styles.pressed]}
            >
              {gps.status === 'loading' ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <Ionicons name="locate" size={18} color={colors.accent} />
              )}
              <Text style={styles.gpsText}>{gps.status === 'loading' ? 'Buscando tu distrito…' : 'Usar mi ubicación'}</Text>
            </Pressable>
          )}
          {gps.message && !gps.denied ? (
            <Text style={gps.status === 'error' ? styles.error : styles.hint}>{gps.message}</Text>
          ) : null}
          <View style={styles.districts}>
            {districtOptions.map((district) => {
              const selected = values.location === district
              return (
                <Pressable
                  key={district}
                  onPress={() => setField('location', selected ? '' : district)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.district, selected && styles.districtSelected]}
                >
                  <Text style={[styles.districtText, selected && styles.districtTextSelected]} numberOfLines={1}>
                    {district}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Field>

        <Field label="Descripción">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={values.description}
            onChangeText={(text) => setField('description', text)}
            placeholderTextColor={colors.muted}
            placeholder="Cuenta qué necesitas"
            multiline
            textAlignVertical="top"
          />
        </Field>

        <Field label="Habilidades requeridas">
          {skills.loading ? <ActivityIndicator color={colors.primary} /> : null}
          {skills.error ? <Text style={styles.error}>{skills.error}</Text> : null}
          <SkillChips skills={skills.data} selectedIds={values.skillIds} onToggle={toggleSkill} />
        </Field>

        {actions.error ? <Text style={styles.serverError}>{actions.error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={actions.saving}
          style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ disabled: actions.saving }}
        >
          {actions.saving ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.submitText}>Publicar proyecto</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const createStyles = ({ colors, fonts }) => ({
  flex: { flex: 1 },
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 18, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  free: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, width: 46, textAlign: 'right' },
  budgetCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 20 },
  budgetCardError: { borderColor: colors.error },
  kicker: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.muted },
  budgetRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 10 },
  currency: { fontFamily: fonts.bold, fontSize: 26, color: colors.text },
  budgetInput: { flex: 1, fontFamily: fonts.bold, fontSize: 42, letterSpacing: -1.8, color: colors.text, padding: 0 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  lockText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accent },
  field: { gap: 8 },
  label: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: { borderColor: colors.error },
  dateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 },
  dateInput: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 16, paddingVertical: 14 },
  textarea: { minHeight: 110 },
  notice: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.pendingLight,
    borderWidth: 1,
    borderColor: colors.pending + '40',
    borderRadius: 18,
    padding: 16,
  },
  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  noticeText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 4 },
  noticeLink: { fontFamily: fonts.semibold, fontSize: 14, color: colors.pending, marginTop: 10 },
  gps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  gpsText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
  pressed: { opacity: 0.7 },
  districts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  district: {
    width: '48.5%',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 8,
  },
  districtSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  districtText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  districtTextSelected: { color: colors.onPrimary },
  hint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  error: { color: colors.error, fontFamily: fonts.regular, fontSize: 13 },
  serverError: { backgroundColor: colors.errorLight, borderRadius: radius.sm, color: colors.error, fontFamily: fonts.regular, padding: 12 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submit: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 17 },
  submitText: { color: colors.onPrimary, fontFamily: fonts.semibold, fontSize: 16 },
})

Field.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.node,
}
