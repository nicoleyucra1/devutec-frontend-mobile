import { StyleSheet, Text } from 'react-native'

// Etiqueta de color para un estado. status viene de src/utils/status.js
export default function StatusBadge({ status, fallback }) {
  if (!status) return <Text style={styles.badge}>{fallback}</Text>
  return <Text style={[styles.badge, { color: status.color, backgroundColor: status.background }]}>{status.label}</Text>
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
})