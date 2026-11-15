import { useState } from 'react'
import PropTypes from 'prop-types'
import { Text, View } from 'react-native'
import FormField from './FormField'
import PrimaryButton from './PrimaryButton'
import { useAuth } from '../hooks/useAuth'
import { useThemedStyles } from '../hooks/useTheme'
import { userService } from '../services/userService'
import { confirmAlert } from '../utils/confirmAlert'
import { errorMessage } from '../utils/errorMessage'
import { formatPhone, normalizePhone } from '../utils/phone'

// Agregar, cambiar o quitar el celular para WhatsApp de la persona con sesión.
// Se usa en la pestaña Perfil y en el contrato, cuando todavía no lo agregó (con otro label y help).
export default function PhoneEditor({ label = 'Celular', help }) {
  const { user, updateUser } = useAuth()
  const styles = useThemedStyles(createStyles)
  const current = user.celular
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null) // 'save' | 'delete' | null
  const [done, setDone] = useState(null)

  const showForm = editing || !current

  const save = async () => {
    const phone = normalizePhone(value)
    if (!phone) {
      setError('Tiene que tener 9 dígitos y empezar con 9, por ejemplo 987 654 321.')
      return
    }
    setBusy('save')
    setError(null)
    try {
      await updateUser(await userService.updatePhone(phone))
      setEditing(false)
      setValue('')
      setDone('Guardamos tu celular.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    if (!(await confirmAlert('¿Quitar tu celular?', 'Ya no te podrán escribir por WhatsApp desde tus contratos.', 'Quitar'))) return
    setBusy('delete')
    setError(null)
    try {
      await updateUser(await userService.deletePhone())
      setDone('Quitaste tu celular.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <View>
      {help ? <Text style={styles.help}>{help}</Text> : null}

      {showForm ? (
        <View style={styles.form}>
          <FormField
            label={`${label} (+51)`}
            value={value}
            onChangeText={(text) => {
              setValue(text)
              setError(null)
              setDone(null)
            }}
            placeholder="987 654 321"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={16}
            error={error}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <PrimaryButton title={busy === 'save' ? 'Guardando…' : 'Guardar celular'} onPress={save} loading={busy === 'save'} />
          {current ? <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setEditing(false)} disabled={busy !== null} /> : null}
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.phone}>+51 {formatPhone(current)}</Text>
          <PrimaryButton
            title="Cambiar"
            variant="secondary"
            onPress={() => {
              setValue(formatPhone(current))
              setEditing(true)
              setDone(null)
            }}
            disabled={busy !== null}
          />
          <PrimaryButton title="Quitar celular" variant="danger" onPress={remove} loading={busy === 'delete'} disabled={busy !== null} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      )}

      {done && !error ? <Text style={styles.done}>{done}</Text> : null}
    </View>
  )
}

PhoneEditor.propTypes = {
  label: PropTypes.string,
  help: PropTypes.string,
}

const createStyles = ({ colors, fonts }) => ({
  help: { fontFamily: fonts.regular, color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  form: { gap: 10 },
  phone: { fontFamily: fonts.semibold, color: colors.text, fontSize: 18, marginBottom: 4 },
  error: { fontFamily: fonts.medium, color: colors.error },
  done: { fontFamily: fonts.medium, color: colors.accent, marginTop: 10 },
})
