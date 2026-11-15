import { ActivityIndicator, Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Avatar from './Avatar'
import { useAuth } from '../hooks/useAuth'
import { useAvatarActions } from '../hooks/useAvatarActions'
import { useThemedStyles } from '../hooks/useTheme'

// La foto de la persona con sesión, con un ícono de cámara: al tocarla se puede cambiar o quitar.
// Muestra la foto del usuario actualizado (no la que venía en el perfil), así cambia apenas termina de subir.
// badgeBorder es el color del fondo donde está la foto, para que el ícono de cámara se separe bien
export default function EditableAvatar({ size = 56, fallbackStyle, textStyle, badgeBorder }) {
  const { user } = useAuth()
  const { preview, busy, openMenu } = useAvatarActions()
  const styles = useThemedStyles(createStyles)
  const isAdmin = user.rol === 'ADMIN'
  const badge = Math.max(22, Math.round(size * 0.4))

  return (
    <Pressable
      onPress={openMenu}
      accessibilityRole="button"
      accessibilityLabel={isAdmin ? 'Foto de perfil de DEVUTEC' : 'Cambiar foto de perfil'}
      accessibilityHint={isAdmin ? undefined : 'Abre las opciones para elegir o quitar tu foto'}
      style={({ pressed }) => pressed && !busy && styles.pressed}
    >
      <Avatar
        name={user.nombre ?? user.email}
        src={preview ?? user.avatarUrl}
        size={size}
        fallbackStyle={fallbackStyle}
        textStyle={textStyle}
      />
      {busy && (
        <View style={[styles.overlay, { width: size, height: size, borderRadius: size / 2 }]}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}
      {!isAdmin && !busy && (
        <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2 }, badgeBorder && { borderColor: badgeBorder }]}>
          <Ionicons name="camera" size={Math.round(badge * 0.55)} color="#0E0E0C" />
        </View>
      )}
    </Pressable>
  )
}

const createStyles = ({ colors }) => ({
  pressed: { opacity: 0.75 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(14,14,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Círculo lima con borde del color de la tarjeta, para que se separe de la foto
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#D7F25C',
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
