import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import StatusBadge from './StatusBadge'
import SkillChips from './SkillChips'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { formatBudget, formatDate } from '../../utils/format'

export default function ProjectCard({ project, onPress }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} accessibilityRole="button">
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {project.title}
        </Text>
        <StatusBadge status={project.status} />
      </View>
      {project.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}
      <View style={styles.meta}>
        <Text style={styles.budget}>{formatBudget(project.budget)}</Text>
        <Text style={styles.muted}>Entrega: {formatDate(project.deadline)}</Text>
      </View>
      {project.location ? (
        <View style={styles.location}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text style={styles.muted}>{project.location}</Text>
        </View>
      ) : null}
      <SkillChips skills={project.skills} />
    </Pressable>
  )
}

const createStyles = ({ colors, fonts }) => ({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  pressed: { opacity: 0.7 },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  title: { color: colors.text, flex: 1, fontFamily: fonts.semibold, fontSize: 16 },
  description: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  budget: { color: colors.text, fontFamily: fonts.bold },
  muted: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  location: { alignItems: 'center', flexDirection: 'row', gap: 4 },
})
