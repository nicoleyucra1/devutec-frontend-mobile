import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import PropTypes from 'prop-types'
import ScreenState from '../../src/components/ScreenState'
import { useAsync } from '../../src/hooks/useAsync'
import { useThemedStyles } from '../../src/hooks/useTheme'
import { contractService } from '../../src/services/contractService'
import { metricsService } from '../../src/services/metricsService'
import { formatBudget, formatDate } from '../../src/utils/format'
import { siteRank } from '../../src/utils/metrics'

function planLabel(data) {
  const access = data.access
  if (!data.enabled) return { text: data.requested ? 'Pediste métricas: falta activarlas' : 'Sin activar', tone: 'muted' }
  if (access?.plan === 'PRO') return { text: `Pro · ${formatBudget(access.proPrice)} al mes`, tone: 'ok' }
  if (access?.plan === 'BASIC') return { text: `Básico · ${formatBudget(access.basicPrice)} al mes`, tone: 'ok' }
  if (access?.locked) return { text: 'Prueba gratis terminada: elige un plan', tone: 'warn' }
  if (access?.trialActive && access.trialEndsAt) return { text: `Gratis hasta el ${formatDate(access.trialEndsAt)}`, tone: 'ok' }
  return { text: 'Los 3 meses gratis empiezan con la primera visita real', tone: 'muted' }
}

// "Mis métricas" (igual que en la web): todas las webs del cliente. Primero las de plan pagado (★), luego prueba
// gratis, bloqueadas y sin datos. Cada web tiene su propio panel y su propia mensualidad.
export default function MyMetricsScreen() {
  const styles = useThemedStyles(createStyles)
  const router = useRouter()
  const sites = useAsync(async ({ signal }) => {
    const contracts = await contractService.getMine({ signal })
    const list = (Array.isArray(contracts) ? contracts : contracts?.content ?? []).filter((c) => c.status !== 'CANCELLED')
    const results = await Promise.all(
      list.map((contract) =>
        metricsService
          .get(contract.id, { signal })
          .then((data) => ({ contract, data }))
          .catch(() => null),
      ),
    )
    return results.filter((item) => item && (item.data.enabled || item.data.requested)).sort((a, b) => siteRank(a.data) - siteRank(b.data))
  }, [])

  if (sites.loading || sites.error) return <ScreenState loading={sites.loading} error={sites.error} onRetry={sites.reload} />

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={false} onRefresh={sites.reload} />}>
      <Stack.Screen options={{ headerShown: true, headerTransparent: false, title: 'Mis métricas' }} />
      <Text style={styles.h1}>Tus webs en un solo lugar.</Text>
      <Text style={styles.text}>
        Cada web tiene su panel y su plan: los 3 primeros meses son gratis desde la primera visita real y después eliges Básico o Pro,
        por mes y por web.
      </Text>
      <Text style={styles.note}>
        ★ Plan activo aparece arriba. Desde tu segunda web con plan, cada web adicional cuesta 25 % menos: Básico S/ 14 y Pro S/ 29 al
        mes (en vez de S/ 19 y S/ 39).
      </Text>
      {sites.data.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.title}>Todavía no tienes webs con métricas</Text>
          <Text style={styles.text}>
            Cuando publiques un proyecto web, marca «Quiero ver cuántas personas visitan mi web». El estudiante las deja instaladas y aquí
            verás todas tus webs.
          </Text>
        </View>
      ) : (
        sites.data.map(({ contract, data }) => (
          <SiteCard key={contract.id} contract={contract} data={data} onOpen={() => router.push(`/metricas/${contract.id}`)} />
        ))
      )}
    </ScrollView>
  )
}

function SiteCard({ contract, data, onOpen }) {
  const styles = useThemedStyles(createStyles)
  const label = planLabel(data)
  const paid = siteRank(data) === 0
  const summary = data.summary
  return (
    <Pressable onPress={onOpen} accessibilityRole="button" style={({ pressed }) => [styles.card, paid && styles.paid, pressed && styles.pressed]}>
      <View style={styles.row}>
        {paid ? <Text style={styles.star}>★</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {contract.projectTitle}
        </Text>
      </View>
      <Text style={styles.small} numberOfLines={1}>
        {data.allowedOrigin ?? 'La web todavía no envía datos reales'}
      </Text>
      <Text style={[styles.pill, styles[label.tone]]}>{label.text}</Text>
      {summary ? (
        <View style={styles.stats}>
          {[
            ['Visitas', summary.visits],
            ['Contactos', summary.contacts],
            ['Pedidos y reservas', summary.orders + summary.reservations],
          ].map(([name, value]) => (
            <View key={name} style={styles.stat}>
              <Text style={styles.small}>{name}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
      ) : data.enabled ? (
        <Text style={styles.small}>El panel está bloqueado hasta que elijas un plan.</Text>
      ) : null}
      <Text style={styles.link}>{data.enabled ? 'Ver panel →' : 'Activar métricas →'}</Text>
    </Pressable>
  )
}

SiteCard.propTypes = {
  contract: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired, projectTitle: PropTypes.string }).isRequired,
  data: PropTypes.shape({ enabled: PropTypes.bool, allowedOrigin: PropTypes.string, summary: PropTypes.object, access: PropTypes.object }).isRequired,
  onOpen: PropTypes.func.isRequired,
}

const createStyles = ({ colors, fonts }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  h1: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.6, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  note: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.accent, backgroundColor: colors.card, borderRadius: 12, padding: 10, overflow: 'hidden' },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 8 },
  paid: { borderColor: colors.accent, borderWidth: 2 },
  pressed: { opacity: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  star: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary, backgroundColor: colors.accent, width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, overflow: 'hidden' },
  title: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  pill: { alignSelf: 'flex-start', fontFamily: fonts.semibold, fontSize: 11, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  ok: { color: colors.accent, backgroundColor: colors.background },
  warn: { color: colors.pending, backgroundColor: colors.pendingLight },
  muted: { color: colors.muted, backgroundColor: colors.background },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 10, alignItems: 'center' },
  value: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
})
