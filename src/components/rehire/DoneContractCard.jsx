import { useEffect, useState } from 'react'
import { Linking, Share, Text, View } from 'react-native'
import { router } from 'expo-router'
import PropTypes from 'prop-types'
import PrimaryButton from '../PrimaryButton'
import { certificateService } from '../../services/certificateService'
import { useThemedStyles } from '../../hooks/useTheme'
import { idType } from '../../utils/propShapes'

// Contrato terminado: el certificado verificable (para el CV) y, para el cliente, volver a contratar
export default function DoneContractCard({ contractId, isClient, freelancerUserId, freelancerName }) {
  const styles = useThemedStyles(createStyles)
  const [certificate, setCertificate] = useState(null)
  const firstName = freelancerName?.split(' ')[0] ?? 'el estudiante'

  useEffect(() => {
    let active = true
    certificateService
      .forContract(contractId)
      .then((data) => active && setCertificate(data))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [contractId])

  const share = () =>
    Share.share({ message: `Mi certificado de trabajo en DEVUTEC (${certificate.code}): ${certificate.verifyUrl}` }).catch(() => {})

  const rehire = () =>
    router.push(`/projects/asistente?invitar=${freelancerUserId}&nombre=${encodeURIComponent(freelancerName ?? '')}`)

  return (
    <View style={{ gap: 12 }}>
      {certificate ? (
        <View style={styles.card}>
          <Text style={styles.kicker}>CERTIFICADO VERIFICABLE</Text>
          <Text style={styles.title}>{isClient ? 'Este trabajo quedó certificado por DEVUTEC' : '🎓 Tu trabajo quedó certificado'}</Text>
          <Text style={styles.muted}>
            {isClient
              ? 'El estudiante puede mostrarlo en su CV: cualquiera lo verifica con el código.'
              : 'Ponlo en tu CV o en LinkedIn: cualquiera lo verifica con el código, sin ver montos ni contactos.'}
          </Text>
          <Text style={styles.code}>{certificate.code}</Text>
          <View style={styles.actions}>
            <PrimaryButton title="Ver certificado" variant="secondary" onPress={() => Linking.openURL(certificate.verifyUrl)} style={{ flex: 1 }} />
            {!isClient ? <PrimaryButton title="Compartir" onPress={share} style={{ flex: 1 }} /> : null}
          </View>
        </View>
      ) : null}

      {isClient ? (
        <View style={styles.card}>
          <Text style={styles.kicker}>VOLVER A CONTRATAR</Text>
          <Text style={styles.title}>¿Te gustó trabajar con {firstName}?</Text>
          <Text style={styles.muted}>
            Publica tu próximo proyecto con invitación para {firstName}: por 48 horas será solo para {firstName}. Si no postula
            a tiempo, se abre para todos.
          </Text>
          <PrimaryButton title="Volver a contratar" onPress={rehire} />
        </View>
      ) : null}
    </View>
  )
}

DoneContractCard.propTypes = {
  contractId: idType.isRequired,
  isClient: PropTypes.bool,
  freelancerUserId: idType,
  freelancerName: PropTypes.string,
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18, gap: 8 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: colors.accent },
  title: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  code: {
    alignSelf: 'flex-start',
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: 1.5,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
})
