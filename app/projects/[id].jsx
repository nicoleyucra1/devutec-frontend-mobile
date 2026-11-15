import { ScrollView, Text, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PrimaryButton from '../../src/components/PrimaryButton'
import SkillChips from '../../src/components/projects/SkillChips'
import StateView from '../../src/components/projects/StateView'
import StatusBadge from '../../src/components/projects/StatusBadge'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { useAuth } from '../../src/hooks/useAuth'
import { useProject } from '../../src/hooks/useProject'
import { formatBudget, formatDate } from '../../src/utils/format'
import PropTypes from 'prop-types'

// En iOS la barra de arriba es transparente por defecto y tapaba el contenido; con fondo sólido
// la pantalla empieza debajo de ella. El color lo pone el tema desde _layout.
const HEADER_OPTIONS = { headerShown: true, headerTransparent: false }

function Meta({ icon, label, value }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={18} color={colors.muted} />
      <View>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  )
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const { data: project, loading, error, reload } = useProject(id)
  const styles = useThemedStyles(createStyles)

  return (
    <>
      <Stack.Screen options={{ ...HEADER_OPTIONS, title: 'Proyecto', headerBackTitle: 'Volver' }} />
      {loading ? <StateView loading message="Cargando proyecto..." /> : null}
      {!loading && error ? <StateView title="No se pudo cargar" message={error} actionLabel="Reintentar" onAction={reload} /> : null}
      {!loading && !error && project ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{project.title}</Text>
            <StatusBadge status={project.status} />
          </View>

          <View style={styles.card}>
            <Meta icon="cash-outline" label="Presupuesto" value={formatBudget(project.budget)} />
            <Meta icon="calendar-outline" label="Fecha límite" value={formatDate(project.deadline)} />
            {project.location ? <Meta icon="location-outline" label="Ubicación" value={project.location} /> : null}
            <Meta icon="time-outline" label="Publicado" value={formatDate(project.createdAt)} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{project.description || 'Sin descripción.'}</Text>
          </View>

          {project.skills?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades requeridas</Text>
              <SkillChips skills={project.skills} />
            </View>
          ) : null}

          {/* Solo un freelancer puede postular, y solo mientras el proyecto siga abierto */}
          {user?.rol === 'FREELANCER' && project.status === 'OPEN' ? (
            <PrimaryButton title="Postular" onPress={() => router.push(`/apply/${project.id}`)} />
          ) : null}
        </ScrollView>
      ) : null}
    </>
  )
}

const createStyles = ({ colors, fonts }) => ({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, padding: 16 },
  header: { gap: 8 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: 14, padding: 16 },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  metaLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  metaValue: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  section: { gap: 8 },
  sectionTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  description: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
})

Meta.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
}
