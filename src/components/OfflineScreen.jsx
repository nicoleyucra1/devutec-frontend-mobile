import { useState } from 'react'
import { Modal, Text, View } from 'react-native'
import NetInfo, { useNetInfo } from '@react-native-community/netinfo'
import { SafeAreaView } from 'react-native-safe-area-context'
import Cuyi from './brand/Cuyi'
import PrimaryButton from './PrimaryButton'
import { isOfflineState } from '../utils/network'
import { useThemedStyles } from '../hooks/useTheme'

// Pantalla completa mientras no hay internet: Cuyi duerme y hay un botón para volver a revisar.
// Va en un Modal para quedar encima de todo sin desmontar la navegación: al volver la conexión
// se quita sola y la persona sigue en la pantalla donde estaba.
export default function OfflineScreen() {
  const netInfo = useNetInfo()
  const styles = useThemedStyles(createStyles)
  const [checking, setChecking] = useState(false)
  const [stillOffline, setStillOffline] = useState(false)

  const offline = isOfflineState(netInfo)

  const retry = async () => {
    setChecking(true)
    setStillOffline(false)
    try {
      const state = await NetInfo.refresh()
      // Si ya hay conexión, useNetInfo se actualiza y la pantalla se cierra sola
      if (isOfflineState(state)) setStillOffline(true)
    } finally {
      setChecking(false)
    }
  }

  return (
    <Modal visible={offline} animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center} accessibilityRole="alert">
          <View style={styles.cuyi}>
            <Cuyi anim="duerme" size={64} />
          </View>
          <Text style={styles.title}>
            Sin <Text style={styles.highlight}>conexión.</Text>
          </Text>
          <Text style={styles.text}>
            Revisa tu wifi o tus datos móviles. Las acciones con dinero se activan cuando vuelvas a conectarte.
          </Text>
          {stillOffline ? <Text style={styles.still}>Todavía sin conexión. Inténtalo en unos segundos.</Text> : null}
        </View>
        <PrimaryButton title={checking ? 'Conectando…' : 'Reintentar'} onPress={retry} loading={checking} style={styles.button} />
      </SafeAreaView>
    </Modal>
  )
}

const createStyles = ({ colors, fonts }) => ({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingBottom: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cuyi: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: -1, color: colors.text, marginTop: 20, textAlign: 'center' },
  highlight: { fontFamily: fonts.serifItalic, fontSize: 32, letterSpacing: -0.5, color: colors.accent },
  text: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 10, textAlign: 'center' },
  still: { fontFamily: fonts.semibold, fontSize: 13, color: colors.error, marginTop: 14, textAlign: 'center' },
  button: { marginTop: 0 },
})
