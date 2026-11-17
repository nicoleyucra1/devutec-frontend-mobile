import { KeyboardAvoidingView, Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PropTypes from 'prop-types'
import { useThemedStyles } from '../hooks/useTheme'

// Panel que sube desde abajo sobre la pantalla actual, con el fondo oscurecido (diseño "Tu propuesta" y
// "Liberar pago"). Tocar el fondo o el botón atrás de Android lo cierra, salvo mientras busy.
export default function BottomSheet({ visible, onClose, busy = false, children }) {
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const close = () => {
    if (!busy) onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior="padding">
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Cerrar" accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.grabber} />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} bounces={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const createStyles = ({ colors }) => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,14,12,0.45)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 6 },
  content: { paddingHorizontal: 20, paddingTop: 14 },
})

BottomSheet.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  children: PropTypes.node,
}
