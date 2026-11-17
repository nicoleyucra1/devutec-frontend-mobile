import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import BottomSheet from '../BottomSheet'
import PrimaryButton from '../PrimaryButton'
import { contractService } from '../../services/contractService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'
import { idType } from '../../utils/propShapes'

const NOTE_MAX = 1000

// "Entregar trabajo": el freelancer pega el link a lo que hizo (Drive, GitHub, Figma, la web publicada...)
// y, si quiere, una nota. El cliente ve ambos en el contrato y en el correo, y con eso decide si libera el pago.
export default function DeliverSheet({ contract, visible, onClose, onDelivered }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [link, setLink] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!link.trim()) {
      setError('Pega el link de tu trabajo')
      return
    }
    setSending(true)
    setError(null)
    try {
      await contractService.deliver(contract.id, { link: link.trim(), nota: nota.trim() || null })
      setLink('')
      setNota('')
      onDelivered()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} busy={sending}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>Entregar trabajo</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {contract.projectTitle}
          </Text>
        </View>
        <Pressable onPress={onClose} disabled={sending} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.label}>Link de tu trabajo</Text>
      <TextInput
        value={link}
        onChangeText={(text) => {
          setLink(text)
          setError(null)
        }}
        placeholder="drive.google.com/..."
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        maxLength={255}
        style={[styles.input, error && styles.inputError]}
        accessibilityLabel="Link de tu trabajo"
      />
      <Text style={styles.hint}>Drive, GitHub, Figma o la web publicada. Revisa que el cliente tenga acceso.</Text>

      <Text style={styles.label}>Nota para {contract.clientName?.split(' ')[0] || 'el cliente'} (opcional)</Text>
      <TextInput
        value={nota}
        onChangeText={setNota}
        multiline
        textAlignVertical="top"
        maxLength={NOTE_MAX}
        placeholder="Qué incluye la entrega y cómo revisarla"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textarea]}
      />

      <View style={styles.note}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
        <Text style={styles.noteText}>El pago sigue en garantía hasta que el cliente revise y confirme la entrega.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton title="Entregar" loading={sending} onPress={submit} style={styles.button} />
    </BottomSheet>
  )
}

DeliverSheet.propTypes = {
  contract: PropTypes.shape({
    id: idType.isRequired,
    projectTitle: PropTypes.string,
    clientName: PropTypes.string,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelivered: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts, radius }) => ({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headText: { flex: 1 },
  title: { fontFamily: fonts.medium, fontSize: 24, letterSpacing: -0.8, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 4 },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.error },
  textarea: { minHeight: 90, lineHeight: 21 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
  },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.accent },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8, marginTop: 12, overflow: 'hidden' },
  button: { marginTop: 16 },
})
