import { Pressable, Text, View } from 'react-native'
import { useThemedStyles } from '../../hooks/useTheme'

// Sin onToggle solo muestra las habilidades; con onToggle se pueden elegir (formulario)
export default function SkillChips({ skills, selectedIds, onToggle }) {
  const styles = useThemedStyles(createStyles)
  if (!skills?.length) return null
  return (
    <View style={styles.row}>
      {skills.map((skill) => {
        const selected = selectedIds?.includes(skill.id)
        const chip = <Text style={[styles.chip, selected && styles.selected]}>{skill.name}</Text>
        return onToggle ? (
          <Pressable
            key={skill.id}
            onPress={() => onToggle(skill.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: Boolean(selected) }}
          >
            {chip}
          </Pressable>
        ) : (
          <View key={skill.id}>{chip}</View>
        )
      })}
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary, color: colors.onPrimary },
})
