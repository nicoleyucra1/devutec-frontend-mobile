import { StyleSheet, Text, View } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { isOfflineState } from '../utils/network'

// Franja arriba de la pantalla que avisa cuando no hay internet y se va sola al volver
export default function OfflineBanner() {
  const netInfo = useNetInfo()
  const insets = useSafeAreaInsets()

  if (!isOfflineState(netInfo)) return null

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 6 }]} accessibilityRole="alert">
      <Text style={styles.text}>Sin conexión a internet. Revisa tu wifi o tus datos.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  // Va encima de todo para no mover el resto de la pantalla
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#0E0E0C',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  text: { color: '#F5F3EE', textAlign: 'center', fontSize: 13, fontFamily: 'Geist_600SemiBold' },
})
