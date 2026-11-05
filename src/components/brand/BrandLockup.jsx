import { View } from 'react-native'
import LogoMark from './LogoMark'
import Wordmark from './Wordmark'

// Logo completo: el símbolo DU y el nombre al lado
export default function BrandLockup({ size = 16 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.6 }} accessibilityLabel="DEV U TEC">
      <LogoMark width={size * 2.1} />
      <Wordmark size={size} />
    </View>
  )
}
