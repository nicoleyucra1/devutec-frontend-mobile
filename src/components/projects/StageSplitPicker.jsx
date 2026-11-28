import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { PART_TOTALS, STAGE_NAMES, stepSplit } from '../../utils/stageSplit'

// El estudiante propone cómo se libera el pago: botones − y + de 5 en 5 por etapa
export default function StageSplitPicker({ value, onChange }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.box}>
      {[0, 1].map((part) => (
        <View key={part} style={styles.part}>
          <Text style={styles.partTitle}>{part === 0 ? `Pago 1 (${PART_TOTALS[0]} % + 10 % de bolsa)` : `Pago 2 (${PART_TOTALS[1]} %)`}</Text>
          {[part * 2, part * 2 + 1].map((index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.name}>{STAGE_NAMES[index]}</Text>
              <Pressable onPress={() => onChange(stepSplit(value, index, -5))} accessibilityRole="button" accessibilityLabel={`Bajar ${STAGE_NAMES[index]}`} hitSlop={6} style={styles.step}>
                <Ionicons name="remove" size={16} color={colors.text} />
              </Pressable>
              <Text style={styles.value}>{value[index]} %</Text>
              <Pressable onPress={() => onChange(stepSplit(value, index, 5))} accessibilityRole="button" accessibilityLabel={`Subir ${STAGE_NAMES[index]}`} hitSlop={6} style={styles.step}>
                <Ionicons name="add" size={16} color={colors.text} />
              </Pressable>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

StageSplitPicker.propTypes = {
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  box: { gap: 8, marginTop: 8 },
  part: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, gap: 6 },
  partTitle: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  step: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  value: { width: 44, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
})
