import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import PropTypes from 'prop-types'
import PrimaryButton from '../PrimaryButton'
import { useAsync } from '../../hooks/useAsync'
import { useThemedStyles } from '../../hooks/useTheme'
import { metricsService } from '../../services/metricsService'
import { summarySentence } from '../../utils/metrics'

// Acceso a las métricas desde el contrato (igual que en la web): en qué va y el botón a la pantalla de métricas
export default function MetricsLinkCard({ contractId, isClient }) {
  const styles = useThemedStyles(createStyles)
  const router = useRouter()
  const { data } = useAsync((options) => metricsService.get(contractId, options), [contractId])
  if (!data) return null
  if (!isClient && !data.enabled && !data.requested) return null

  let title
  let action
  let tab = 'panel'
  if (!data.enabled) {
    title = isClient
      ? data.requested
        ? 'Pediste métricas para tu web: actívalas para que se puedan instalar.'
        : 'Mira cuántas personas visitan tu web y cuántas te contactan.'
      : 'El cliente pidió métricas. Cuando las active, aquí verás cómo integrarlas.'
    action = isClient ? 'Activar métricas' : 'Ver detalle'
  } else if (!data.integrated) {
    title = isClient ? 'Activadas. Esperando la primera visita de tu web.' : 'Integra las métricas en la web antes de la Entrega final.'
    action = isClient ? 'Ver panel' : 'Cómo integrarlo'
    if (!isClient) tab = 'integrar'
  } else if (data.access?.locked) {
    title = isClient ? 'Tu prueba gratis terminó. Elige un plan para ver tus números.' : 'La web está enviando datos ✓'
    action = 'Ver panel'
  } else {
    title = summarySentence(data.summary)
    action = 'Ver panel'
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>MÉTRICAS DE LA WEB</Text>
      <Text style={styles.title}>{title}</Text>
      <PrimaryButton title={action} variant="secondary" onPress={() => router.push(`/metricas/${contractId}?tab=${tab}`)} />
    </View>
  )
}

MetricsLinkCard.propTypes = {
  contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isClient: PropTypes.bool,
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 8 },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  title: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.text },
})
