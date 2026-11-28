import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import BottomSheet from '../BottomSheet'
import PrimaryButton from '../PrimaryButton'
import { contractService } from '../../services/contractService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'

// "Pedir cambios" (igual que en la web): el cliente cuenta qué quiere cambiar de la etapa entregada.
// La etapa vuelve al estudiante y el pago sigue en garantía. Máximo 2 rondas por etapa.
export default function ChangesSheet({ contractId, stageName, freelancerName, roundsLeft, visible, onClose, onDone }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const submit = async () => {
    if (!note.trim()) {
      setError('Cuéntale qué quieres cambiar.')
      return
    }
    setSending(true)
    setError(null)
    try {
      await contractService.requestChanges(contractId, { nota: note.trim() })
      setNote('')
      onDone()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} busy={sending}>
      <View style={styles.head}>
        <Text style={styles.title}>Pedir cambios en {stageName ?? 'la entrega'}</Text>
        <Pressable onPress={onClose} disabled={sending} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
      </View>
      <Text style={styles.text}>
        Cuéntale a {freelancerName ?? 'el estudiante'} qué quieres cambiar. La etapa vuelve a sus manos y el pago sigue en garantía.
        Te {roundsLeft === 1 ? 'queda 1 ronda' : `quedan ${roundsLeft} rondas`} de cambios en esta etapa.
      </Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={2000}
        placeholder="Por ejemplo: cambia el color del botón a rojo y agrega mi horario"
        placeholderTextColor={colors.muted}
        style={styles.input}
        textAlignVertical="top"
        accessibilityLabel="Qué quieres cambiar"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton title="Pedir cambios" loading={sending} onPress={submit} />
    </BottomSheet>
  )
}

ChangesSheet.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stageName: PropTypes.string,
  freelancerName: PropTypes.string,
  roundsLeft: PropTypes.number.isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 },
  title: { flex: 1, fontFamily: fonts.medium, fontSize: 22, letterSpacing: -0.6, color: colors.text },
  close: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted, marginBottom: 12 },
  input: { minHeight: 120, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 14, padding: 12, color: colors.text, fontFamily: fonts.regular, fontSize: 15, marginBottom: 12 },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, marginBottom: 8 },
})
