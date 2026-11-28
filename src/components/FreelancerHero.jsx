import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Avatar from './Avatar'
import EditableAvatar from './EditableAvatar'
import { useTheme, useThemedStyles } from '../hooks/useTheme'
import PropTypes from 'prop-types'
import { freelancerProfileShape } from '../utils/propShapes'

function studyLabel(profile) {
  if (profile.egresado) return 'Egresado'
  if (profile.ciclo) return `Ciclo ${profile.ciclo}`
  return null
}

// "35.00" se muestra como S/ 35 grande y .00 en gris, como en el diseño
function splitRate(value) {
  const [soles, cents] = Number(value).toFixed(2).split('.')
  return { soles, cents }
}

// Tarjeta oscura del freelancer: nombre, estudios, tarifa por hora y calificación.
// Se usa en su pestaña Perfil y en el perfil público que ven los clientes.
// editable: en su propia pestaña Perfil la foto se puede tocar para cambiarla.
export default function FreelancerHero({ profile, editable = false }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const hasRate = profile.tarifaHora !== null && profile.tarifaHora !== undefined
  const rate = hasRate ? splitRate(profile.tarifaHora) : null

  return (
    <View style={styles.hero}>
      <View style={styles.identity}>
        {editable ? (
          <EditableAvatar size={56} fallbackStyle={styles.avatar} textStyle={styles.avatarText} badgeBorder={StyleSheet.flatten(styles.hero).backgroundColor} />
        ) : (
          <Avatar name={profile.nombre} src={profile.avatarUrl} size={56} fallbackStyle={styles.avatar} textStyle={styles.avatarText} />
        )}
        <View style={styles.flex}>
          <Text style={styles.name}>{profile.nombre}</Text>
          <Text style={styles.muted}>
            {[profile.universidad, studyLabel(profile)].filter(Boolean).join(' · ') || 'Freelancer de DEVUTEC'}
          </Text>
          {typeof profile.activeProjects === 'number' ? (
            <View style={[styles.status, profile.activeProjects > 0 ? styles.statusBusy : styles.statusFree]}>
              <Text style={[styles.statusText, profile.activeProjects > 0 ? styles.statusTextBusy : styles.statusTextFree]}>
                {profile.activeProjects > 0
                  ? `⏳ Con ${profile.activeProjects === 1 ? 'un proyecto' : `${profile.activeProjects} proyectos`} en curso`
                  : '🟢 Disponible'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.rateRow}>
        <View>
          <Text style={styles.kicker}>TARIFA POR HORA</Text>
          {hasRate ? (
            <Text style={styles.rate}>
              S/ {rate.soles}
              <Text style={styles.rateCents}>.{rate.cents}</Text>
            </Text>
          ) : (
            <Text style={styles.rateMissing}>Por definir</Text>
          )}
        </View>
        {profile.egresado && (
          <View style={styles.pill}>
            <Ionicons name="checkmark" size={12} color={colors.lime} />
            <Text style={styles.pillText}>Egresado UTEC</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <Text style={styles.statValue}>
          {profile.calificacionPromedio ? `${Number(profile.calificacionPromedio).toFixed(1)} ★` : '—'}
        </Text>
        <Text style={styles.statLabel}>
          {profile.calificacionPromedio ? 'calificación promedio' : 'Todavía no tiene reseñas'}
        </Text>
      </View>
    </View>
  )
}

const createStyles = ({ colors, fonts, isDark }) => ({
  // Tarjeta tinta en modo claro; en oscuro el fondo ya es tinta, así que se usa la tarjeta con borde
  hero: {
    backgroundColor: isDark ? colors.card : colors.ink,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
  },
  flex: { flex: 1 },
  // Estado del estudiante: disponible o con un proyecto en curso
  status: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 },
  statusFree: { backgroundColor: colors.lime },
  statusBusy: { backgroundColor: colors.pendingLight ?? colors.card },
  statusText: { fontFamily: fonts.semibold, fontSize: 11 },
  statusTextFree: { color: colors.ink },
  statusTextBusy: { color: colors.pending ?? colors.text },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Sin foto: iniciales en tinta sobre un círculo lima
  avatar: { backgroundColor: colors.lime },
  avatarText: { fontSize: 16, color: colors.ink },
  name: { fontFamily: fonts.semibold, fontSize: 18, color: '#FFFFFF' },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: '#AAA8A0', marginTop: 2 },
  rateRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 20 },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, color: '#8F8D86' },
  rate: { fontFamily: fonts.semibold, fontSize: 40, letterSpacing: -2, color: '#FFFFFF', marginTop: 6, fontVariant: ['tabular-nums'] },
  rateCents: { color: '#8F8D86' },
  rateMissing: { fontFamily: fonts.semibold, fontSize: 22, color: '#FFFFFF', marginTop: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: 'rgba(215,242,92,0.14)',
  },
  pillText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.lime },
  stats: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2C2C28' },
  statValue: { fontFamily: fonts.semibold, fontSize: 18, color: '#FFFFFF' },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: '#8F8D86', marginTop: 2 },
})

FreelancerHero.propTypes = {
  profile: freelancerProfileShape.isRequired,
  editable: PropTypes.bool,
}
