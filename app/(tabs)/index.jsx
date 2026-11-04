import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/hooks/useAuth'
import { ROLE_LABELS } from '../../src/utils/roles'
import { colors } from '../../src/theme'

export default function HomeScreen() {
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {user.nombre ?? user.email}</Text>
      <Text style={styles.muted}>Cuenta de {ROLE_LABELS[user.rol]?.toLowerCase() ?? user.rol}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginTop: 4 },
})
