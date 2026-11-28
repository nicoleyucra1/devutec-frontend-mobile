import { Text } from 'react-native'
import PropTypes from 'prop-types'
import { useThemedStyles } from '../../hooks/useTheme'

const WHEN = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

// En el detalle del proyecto: invitación de «volver a contratar» que sigue siendo exclusiva
export default function InvitationBanner({ project, viewerId }) {
  const styles = useThemedStyles(createStyles)
  const status = project.invitationStatus
  if (status !== 'PENDING' && status !== 'ACCEPTED') return null
  const name = project.invitedFreelancerName?.split(' ')[0] ?? 'el estudiante'
  const until = project.inviteExpiresAt ? WHEN.format(new Date(project.inviteExpiresAt)) : ''
  let text = null
  if (viewerId === project.clientId) {
    text =
      status === 'ACCEPTED'
        ? `${name} ya postuló a tu invitación. Mientras decides, el proyecto sigue siendo solo para ${name}.`
        : `Invitaste a ${name}: es solo para ${name} hasta el ${until}. Si no postula, se abre para todos.`
  } else if (viewerId === project.invitedFreelancerUserId) {
    text =
      status === 'ACCEPTED'
        ? 'Ya postulaste a esta invitación. El cliente está revisando tu propuesta.'
        : `${project.clientName ?? 'El cliente'} quiere volver a trabajar contigo. Es solo para ti hasta el ${until}.`
  }
  if (!text) return null
  return (
    <Text style={styles.banner} accessibilityRole="text">
      <Text style={styles.bold}>🔁 Invitación privada. </Text>
      {text}
    </Text>
  )
}

InvitationBanner.propTypes = {
  project: PropTypes.object.isRequired,
  viewerId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

const createStyles = ({ colors, fonts }) => ({
  banner: {
    backgroundColor: colors.accentLight,
    color: colors.accent,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    overflow: 'hidden',
  },
  bold: { fontFamily: fonts.semibold },
})
