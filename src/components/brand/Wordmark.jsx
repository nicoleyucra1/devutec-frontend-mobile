import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

// Nombre de la marca: DEV (U en un círculo lima) TEC
export default function Wordmark({ size = 18, color }) {
  const { colors, fonts } = useTheme()
  const textStyle = { fontFamily: fonts.extrabold, fontSize: size, color: color ?? colors.text, letterSpacing: size * 0.02 }
  const circle = size * 1.35

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel="DEV U TEC">
      <Text style={textStyle}>DEV</Text>
      <View style={[styles.u, { width: circle, height: circle, borderRadius: circle / 2, marginHorizontal: size * 0.3 }]}>
        <Text style={[textStyle, { color: colors.limeText, fontSize: size * 0.8 }]}>U</Text>
      </View>
      <Text style={textStyle}>TEC</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  u: { backgroundColor: '#D7F25C', alignItems: 'center', justifyContent: 'center' },
})
