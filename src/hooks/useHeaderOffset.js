import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Alto de la barra de título de arriba (la de "Perfil" o "Contrato"). KeyboardAvoidingView lo necesita
// en las pantallas que tienen esa barra para calcular bien cuánto subir cuando aparece el teclado.
export function useHeaderOffset() {
  const insets = useSafeAreaInsets()
  return insets.top + (Platform.OS === 'ios' ? 44 : 56)
}
