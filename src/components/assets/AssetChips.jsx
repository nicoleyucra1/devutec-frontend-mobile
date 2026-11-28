import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { useTheme, useThemedStyles } from '../../hooks/useTheme'

// Archivos que el cliente ya subió, como chips con un botón para quitarlos
export default function AssetChips({ assets, onRemove, removing }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  if (assets.length === 0) return null
  return (
    <View style={styles.row}>
      {assets.map((asset) => (
        <View key={asset.id} style={styles.chip}>
          <Ionicons name={asset.kind === 'PDF' ? 'document-text-outline' : 'image-outline'} size={14} color={colors.muted} />
          <Text style={styles.name} numberOfLines={1}>
            {asset.fileName}
          </Text>
          {onRemove ? (
            <Pressable
              onPress={() => onRemove(asset)}
              disabled={removing === asset.id}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${asset.fileName}`}
            >
              <Ionicons name="close" size={15} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  )
}

AssetChips.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired, kind: PropTypes.string, fileName: PropTypes.string })).isRequired,
  onRemove: PropTypes.func,
  removing: PropTypes.number,
}

const createStyles = ({ colors, fonts }) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  name: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.text },
})
