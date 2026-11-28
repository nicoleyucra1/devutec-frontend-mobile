import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import Avatar from '../Avatar'
import ThemeToggle from '../ThemeToggle'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { todayLabel } from '../../utils/format'

// Cabecera del Inicio: avatar, la fecha de hoy y el saludo. El botón redondo abre el escáner de QR
// (en el diseño es una campana, pero la app no tiene notificaciones: el escáner es lo que sí existe).
export default function HomeHeader({ name, avatarUrl, title, onScan }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.header}>
      <Avatar
        name={name}
        src={avatarUrl}
        size={46}
        fallbackStyle={styles.avatar}
        textStyle={styles.avatarText}
      />
      <View style={styles.text}>
        <Text style={styles.date}>{todayLabel(new Date())}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      {/* Sol y luna: modo claro u oscuro con un toque */}
      <ThemeToggle />
      <Pressable
        onPress={onScan}
        accessibilityRole="button"
        accessibilityLabel="Escanear el QR de un freelancer"
        style={({ pressed }) => [styles.round, pressed && styles.pressed]}
      >
        <Ionicons name="qr-code-outline" size={20} color={colors.text} />
      </Pressable>
    </View>
  )
}

const createStyles = ({ colors, fonts }) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { backgroundColor: colors.night },
  avatarText: { color: colors.onNight },
  text: { flex: 1 },
  date: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  title: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.8, color: colors.text, marginTop: 2 },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
})

HomeHeader.propTypes = {
  name: PropTypes.string,
  avatarUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  onScan: PropTypes.func.isRequired,
}
