import { StyleSheet, Text, View } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Cuyi from './brand/Cuyi'
import { isOfflineState } from '../utils/network'

// Tarjeta arriba de la pantalla, como en el diseño (M9): Cuyi duerme mientras no hay internet
// y la tarjeta se va sola al volver la conexión. Es igual en modo claro y oscuro.
export default function OfflineBanner() {
  const netInfo = useNetInfo()
  const insets = useSafeAreaInsets()

  if (!isOfflineState(netInfo)) return null

  return (
    <View style={[styles.wrapper, { top: insets.top + 8 }]} pointerEvents="none">
      <View style={styles.card} accessibilityRole="alert">
        <View style={styles.cuyi}>
          <Cuyi anim="duerme" size={32} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>Sin conexión</Text>
          <Text style={styles.text}>Revisa tu wifi o tus datos. Las acciones con dinero se activan al reconectar.</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Va encima de todo para no mover el resto de la pantalla
  wrapper: { position: 'absolute', left: 12, right: 12, zIndex: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0E0E0C',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0E0E0C',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cuyi: { width: 44, height: 44, borderRadius: 11, backgroundColor: '#D7F25C', alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  title: { fontFamily: 'Geist_600SemiBold', fontSize: 14, color: '#F5F3EE' },
  text: { fontFamily: 'Geist_400Regular', fontSize: 12, lineHeight: 16, color: '#AAA8A0', marginTop: 2 },
})
