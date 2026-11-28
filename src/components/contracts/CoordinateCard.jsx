import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import BottomSheet from '../BottomSheet'
import PrimaryButton from '../PrimaryButton'
import { REPORT_REASONS, reportService } from '../../services/reportService'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { errorMessage } from '../../utils/errorMessage'
import { idType } from '../../utils/propShapes'

// Reemplaza a la tarjeta de WhatsApp: DEVUTEC no comparte celulares entre cliente y estudiante.
// Todo se coordina dentro del contrato (entregas, pedidos de cambios y la traductora), así el pago queda protegido.
// "Reportar" abre una hoja para avisar si la otra persona pide hablar o pagar por fuera.
export default function CoordinateCard({ contract, isClient }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('PAGO_POR_FUERA')
  const [detail, setDetail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  if (contract.status === 'CANCELLED') return null
  const otherName = (isClient ? contract.freelancerName : contract.clientName) ?? (isClient ? 'el estudiante' : 'el cliente')
  const firstName = otherName.split(' ')[0]

  const submit = async () => {
    setSending(true)
    setError(null)
    try {
      await reportService.create({ contractId: contract.id, reason, detail: detail.trim() || undefined })
      setOpen(false)
      setDetail('')
      Alert.alert('Gracias por avisarnos', 'El equipo de DEVUTEC lo va a revisar.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>COORDINAR</Text>
      <Text style={styles.text}>
        Todo se coordina aquí: entregas, pedidos de cambios y la traductora. DEVUTEC no comparte celulares para que tu pago siga
        protegido por la garantía.
      </Text>
      <Text style={styles.small}>Los pagos y los cambios de monto se hacen solo en DEVUTEC: fuera de aquí nadie te protege.</Text>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" style={styles.reportRow} hitSlop={6}>
        <Ionicons name="flag-outline" size={15} color={colors.muted} />
        <Text style={styles.reportText}>Reportar a {firstName}</Text>
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} busy={sending}>
        <View style={styles.head}>
          <Text style={styles.title}>Reportar a {firstName}</Text>
          <Pressable onPress={() => setOpen(false)} disabled={sending} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.small}>
          Los pagos y los acuerdos se hacen solo dentro de DEVUTEC: así tu dinero queda en garantía. Cuéntanos qué pasó y el equipo
          lo revisa.
        </Text>
        <View style={styles.options}>
          {Object.entries(REPORT_REASONS).map(([value, label]) => {
            const selected = reason === value
            return (
              <Pressable
                key={value}
                onPress={() => setReason(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={colors.text} />
                <Text style={styles.optionText}>{label}</Text>
              </Pressable>
            )
          })}
        </View>
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="Detalle (opcional)"
          placeholderTextColor={colors.muted}
          multiline
          maxLength={1000}
          textAlignVertical="top"
          style={styles.input}
          accessibilityLabel="Detalle del reporte"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title="Enviar reporte" onPress={submit} loading={sending} style={styles.submit} />
      </BottomSheet>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 6 },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2 },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  reportText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 },
  title: { fontFamily: fonts.medium, fontSize: 22, letterSpacing: -0.6, color: colors.text, flex: 1 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: { gap: 8, marginTop: 14 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12 },
  optionSelected: { borderColor: colors.text },
  optionText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, marginTop: 8 },
  submit: { marginTop: 14 },
})

CoordinateCard.propTypes = {
  contract: PropTypes.shape({
    id: idType.isRequired,
    status: PropTypes.string,
    clientName: PropTypes.string,
    freelancerName: PropTypes.string,
  }).isRequired,
  isClient: PropTypes.bool,
}
