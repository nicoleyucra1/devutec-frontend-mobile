import { StyleSheet, Text } from 'react-native'
import { STATUS_LABELS } from '../../utils/format'

const STATUS_COLORS = {
  OPEN: { backgroundColor: '#dcfce7', color: '#166534' },
  IN_PROGRESS: { backgroundColor: '#fef9c3', color: '#854d0e' },
  DONE: { backgroundColor: '#f3f4f6', color: '#374151' },
}

export default function StatusBadge({ status }) {
  const palette = STATUS_COLORS[status] ?? STATUS_COLORS.DONE
  return <Text style={[styles.badge, palette]}>{STATUS_LABELS[status] ?? status}</Text>
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
})
