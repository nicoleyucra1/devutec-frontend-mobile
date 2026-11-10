import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, useThemedStyles } from '../hooks/useTheme'

// Iniciales para el avatar ("CR" para Camila Ríos)
function initials(name) {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

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
export default function FreelancerHero({ profile }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const hasRate = profile.tarifaHora !== null && profile.tarifaHora !== undefined
  const rate = hasRate ? splitRate(profile.tarifaHora) : null

  return (
    <View style={styles.hero}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(profile.nombre)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{profile.nombre}</Text>
          <Text style={styles.muted}>
            {[profile.universidad, studyLabel(profile)].filter(Boolean).join(' · ') || 'Freelancer de DevUTEC'}
          </Text>
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
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
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
