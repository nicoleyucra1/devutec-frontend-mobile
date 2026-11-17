import { useState } from 'react'
import { Pressable, ScrollView, Share, Text, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Money from '../../src/components/Money'
import PrimaryButton from '../../src/components/PrimaryButton'
import ApplySheet from '../../src/components/projects/ApplySheet'
import SkillChips from '../../src/components/projects/SkillChips'
import StateView from '../../src/components/projects/StateView'
import StatusBadge from '../../src/components/projects/StatusBadge'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { useAuth } from '../../src/hooks/useAuth'
import { useProject } from '../../src/hooks/useProject'
import { formatDate } from '../../src/utils/format'
import PropTypes from 'prop-types'

const projectCode = (id) => `#PR-${String(id).padStart(4, '0')}`

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

// Botón redondo de la cabecera (volver y compartir)
function RoundButton({ icon, label, onPress }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  )
}

// Detalle del proyecto (mockup): monto grande, estado y código arriba. El freelancer postula desde un panel
// que sube sobre esta misma pantalla ("Tu propuesta").
export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: project, loading, error, reload } = useProject(id)
  const styles = useThemedStyles(createStyles)
  const [applying, setApplying] = useState(false)

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/projects'))
  const share = () =>
    Share.share({ message: `${project.title} en DEVUTEC: ${project.description ?? ''}`.trim() }).catch(() => {})

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {loading ? <StateView loading message="Cargando proyecto..." /> : null}
      {!loading && error ? <StateView title="No se pudo cargar" message={error} actionLabel="Reintentar" onAction={reload} /> : null}
      {!loading && !error && project ? (
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
          <View style={styles.topBar}>
            <RoundButton icon="chevron-back" label="Volver" onPress={goBack} />
            <RoundButton icon="share-outline" label="Compartir proyecto" onPress={share} />
          </View>

          <View style={styles.statusRow}>
            <StatusBadge status={project.status} />
            <Text style={styles.code}>{projectCode(project.id)}</Text>
          </View>
          <Money value={project.budget} style={styles.amount} centsStyle={styles.cents} />
          <View style={styles.fixed}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent} />
            <Text style={styles.fixedText}>Pago fijo · retenido antes de empezar</Text>
          </View>
          <Text style={styles.title}>{project.title}</Text>
          {project.clientName ? <Text style={styles.client}>{project.clientName}</Text> : null}

          <View style={styles.card}>
            <Meta icon="calendar-outline" label="Fecha límite" value={formatDate(project.deadline)} />
            {project.location ? <Meta icon="location-outline" label="Distrito" value={project.location} /> : null}
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
            <>
              <PrimaryButton title="Postular" onPress={() => setApplying(true)} />
              <ApplySheet
                project={project}
                visible={applying}
                onClose={() => setApplying(false)}
                onApplied={() => {
                  setApplying(false)
                  router.replace('/applications')
                }}
              />
            </>
          ) : null}
        </ScrollView>
      ) : null}
    </>
  )
}

const createStyles = ({ colors, fonts }) => ({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, paddingHorizontal: 20, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  code: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, letterSpacing: 0.5 },
  amount: { fontFamily: fonts.bold, fontSize: 48, letterSpacing: -2.4, color: colors.text, marginTop: -4 },
  cents: { color: colors.muted },
  fixed: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -8 },
  fixedText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8 },
  client: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, marginTop: -10 },
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

RoundButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
}
