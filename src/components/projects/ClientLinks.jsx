import { Linking, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'
import { filledLinks, shortLink } from '../../utils/socialLinks'

// "Sobre el cliente" en el detalle del proyecto: las redes de su negocio, para que el freelancer vea el estilo
// de la marca antes de postular. Cada una abre la app o el navegador. Si no puso ninguna, no se muestra.
export default function ClientLinks({ clientName, links }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const filled = filledLinks(links)
  if (filled.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Sobre el cliente</Text>
      <Text style={styles.help}>
        Mira las redes de {clientName || 'su negocio'} para conocer el estilo de la marca.
      </Text>
      <View style={styles.chips}>
        {filled.map((link) => (
          <Pressable
            key={link.key}
            onPress={() => Linking.openURL(link.url).catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel={`Abrir ${link.label}: ${shortLink(link.key, link.url)}`}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Ionicons name={link.icon} size={16} color={colors.text} />
            <Text style={styles.chipText} numberOfLines={1}>
              {shortLink(link.key, link.url)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

ClientLinks.propTypes = {
  clientName: PropTypes.string,
  links: PropTypes.shape({
    instagram: PropTypes.string,
    facebook: PropTypes.string,
    tiktok: PropTypes.string,
    sitioWeb: PropTypes.string,
  }),
}

const createStyles = ({ colors, fonts }) => ({
  section: { gap: 8 },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  help: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pressed: { opacity: 0.7 },
  chipText: { flexShrink: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
})
