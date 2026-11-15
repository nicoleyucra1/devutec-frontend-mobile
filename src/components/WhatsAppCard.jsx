import { useState } from 'react'
import { Linking, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PhoneEditor from './PhoneEditor'
import PrimaryButton from './PrimaryButton'
import { useAuth } from '../hooks/useAuth'
import { useTheme, useThemedStyles } from '../hooks/useTheme'
import { whatsappLink } from '../utils/phone'

// Contacto por WhatsApp entre las dos personas del contrato. Los celulares solo llegan aquí: el backend
// no los manda a nadie más ni en contratos cancelados.
// Si la otra persona no agregó su celular se avisa; si eres tú quien no lo agregó, lo puedes agregar aquí mismo.
export default function WhatsAppCard({ contract, isClient }) {
  const { user } = useAuth()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const [error, setError] = useState(null)
  if (contract.status === 'CANCELLED') return null

  const otherName = (isClient ? contract.freelancerName : contract.clientName) ?? (isClient ? 'el freelancer' : 'el cliente')
  const otherPhone = isClient ? contract.freelancerPhone : contract.clientPhone
  const firstName = otherName.split(' ')[0]
  const message = `Hola ${firstName}, te escribo por el contrato de “${contract.projectTitle}” en DEVUTEC.`

  // wa.me abre la app de WhatsApp si está instalada; si no, la web de WhatsApp
  const openWhatsApp = async () => {
    setError(null)
    try {
      await Linking.openURL(whatsappLink(otherPhone, message))
    } catch {
      setError('No pudimos abrir WhatsApp en este celular.')
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>COORDINAR</Text>
      {otherPhone ? (
        <>
          <Text style={styles.text}>Habla directo con {firstName} para coordinar detalles del trabajo.</Text>
          <PrimaryButton
            title="Escribir por WhatsApp"
            icon={<Ionicons name="logo-whatsapp" size={20} color={colors.onPrimary} />}
            onPress={openWhatsApp}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      ) : (
        <Text style={styles.muted}>
          {firstName} todavía no agregó su celular. Cuando lo haga, aparecerá aquí el botón para escribirle por WhatsApp.
        </Text>
      )}

      {!user.celular && (
        <View style={styles.divider}>
          <Text style={styles.subtitle}>Agrega tu celular</Text>
          <PhoneEditor label="Tu celular" help={`Así ${firstName} también te puede escribir. Solo lo ven las personas de tus contratos.`} />
        </View>
      )}
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 12 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: colors.muted },
  text: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  error: { fontFamily: fonts.medium, color: colors.error },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginTop: 4 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginBottom: 6 },
})
