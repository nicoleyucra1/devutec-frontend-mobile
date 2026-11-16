import { useState } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import FormField from './FormField'
import PrimaryButton from './PrimaryButton'
import { useAuth } from '../hooks/useAuth'
import { useTheme, useThemedStyles } from '../hooks/useTheme'
import { userService } from '../services/userService'
import { errorMessage } from '../utils/errorMessage'
import { filledLinks, shortLink, SOCIAL_NETWORKS } from '../utils/socialLinks'

// Valores del formulario a partir de lo guardado: "@pizzeria" en vez del link completo, que también se acepta
const formFrom = (redes) =>
  Object.fromEntries(SOCIAL_NETWORKS.map(({ key }) => [key, shortLink(key, redes?.[key])]))

// Redes del negocio del cliente (pestaña Perfil). Las ve el freelancer en el detalle de sus proyectos para
// conocer el estilo de la marca. Si no hay ninguna guardada, el formulario aparece directo.
export default function SocialLinksEditor() {
  const { user, updateUser } = useAuth()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const saved = filledLinks(user.redes)
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(() => formFrom(user.redes))
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)

  const showForm = editing || saved.length === 0

  const startEditing = () => {
    setValues(formFrom(user.redes))
    setEditing(true)
    setDone(null)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const links = Object.fromEntries(SOCIAL_NETWORKS.map(({ key }) => [key, values[key].trim()]))
      await updateUser(await userService.updateLinks(links))
      setEditing(false)
      setDone('Guardamos tus redes.')
    } catch (err) {
      // El backend dice cuál está mal, por ejemplo "El link de Instagram no es válido"
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!showForm) {
    return (
      <View style={styles.list}>
        {saved.map((link) => (
          <Pressable
            key={link.key}
            onPress={() => Linking.openURL(link.url).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel={`${link.label}: ${shortLink(link.key, link.url)}`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Ionicons name={link.icon} size={20} color={colors.text} />
            <View style={styles.flex}>
              <Text style={styles.rowLabel}>{link.label}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {shortLink(link.key, link.url)}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.muted} />
          </Pressable>
        ))}
        <PrimaryButton title="Editar redes" variant="secondary" onPress={startEditing} style={styles.editButton} />
        {done ? <Text style={styles.done}>{done}</Text> : null}
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.help}>
        El freelancer las ve en tus proyectos para conocer el estilo de tu marca. Puedes poner tu usuario o el link.
      </Text>
      {SOCIAL_NETWORKS.map((network) => (
        <FormField
          key={network.key}
          label={network.label}
          value={values[network.key]}
          onChangeText={(text) => {
            setValues((prev) => ({ ...prev, [network.key]: text }))
            setError(null)
          }}
          placeholder={network.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={network.key === 'sitioWeb' ? 'url' : 'default'}
          maxLength={255}
        />
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <PrimaryButton title={saving ? 'Guardando…' : 'Guardar redes'} onPress={save} loading={saving} />
        {saved.length > 0 ? (
          <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setEditing(false)} disabled={saving} />
        ) : null}
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts, radius }) => ({
  flex: { flex: 1 },
  help: { fontFamily: fonts.regular, color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  list: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  pressed: { opacity: 0.6 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  rowValue: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  editButton: { marginTop: 8 },
  actions: { gap: 10 },
  error: {
    fontFamily: fonts.medium,
    color: colors.error,
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 12,
  },
  done: { fontFamily: fonts.medium, color: colors.accent, marginTop: 10 },
})
