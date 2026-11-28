import { Image, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import { useAsync } from '../../hooks/useAsync'
import { useThemedStyles } from '../../hooks/useTheme'
import { assetService } from '../../services/assetService'
import { idType } from '../../utils/propShapes'

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`

// Archivos del negocio en el proyecto y en el contrato.
// El cliente, el estudiante contratado y el admin ven las imágenes (con la sesión) y lo que la IA entendió de cada
// archivo. Los demás estudiantes solo ven cuántos hay. El PDF se descarga desde la web.
export default function ProjectAssetsCard({ projectId }) {
  const styles = useThemedStyles(createStyles)
  const { data } = useAsync((options) => assetService.list(projectId, options), [projectId])
  if (!data || data.images + data.pdfs === 0) return null

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>ARCHIVOS DEL NEGOCIO</Text>
      {!data.canDownload ? (
        <Text style={styles.text}>
          El cliente adjuntó {[data.images && plural(data.images, 'imagen', 'imágenes'), data.pdfs && plural(data.pdfs, 'PDF', 'PDF')].filter(Boolean).join(' y ')} de su
          negocio (logo, fotos o carta). Podrás verlos cuando te contraten.
        </Text>
      ) : (
        <>
          {data.files.map((asset) => (
            <View key={asset.id} style={styles.item}>
              {asset.kind === 'IMAGE' ? (
                <Image source={assetService.imageSource(asset)} style={styles.thumb} resizeMode="cover" accessibilityLabel={asset.fileName} />
              ) : (
                <View style={[styles.thumb, styles.pdf]}>
                  <Text style={styles.pdfText}>PDF</Text>
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {asset.fileName}
                </Text>
                {asset.kind === 'PDF' ? <Text style={styles.small}>{plural(asset.pages ?? 1, 'página', 'páginas')} · descárgalo desde la web</Text> : null}
                {asset.summary ? <Text style={styles.small}>{asset.summary}</Text> : null}
              </View>
            </View>
          ))}
          <Text style={styles.small}>DEVUTEC revisó y limpió cada archivo antes de guardarlo.</Text>
        </>
      )}
    </View>
  )
}

ProjectAssetsCard.propTypes = {
  projectId: idType.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 8 },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  pdf: { alignItems: 'center', justifyContent: 'center' },
  pdfText: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
})
