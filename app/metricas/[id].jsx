import { useState } from 'react'
import { Linking, Pressable, RefreshControl, ScrollView, Share, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenState from '../../src/components/ScreenState'
import { useAsync } from '../../src/hooks/useAsync'
import { useAuth } from '../../src/hooks/useAuth'
import { useContract } from '../../src/hooks/useContracts'
import { useTheme, useThemedStyles } from '../../src/hooks/useTheme'
import { metricsService } from '../../src/services/metricsService'
import { confirmAlert } from '../../src/utils/confirmAlert'
import { errorMessage } from '../../src/utils/errorMessage'
import { formatBudget, formatDate, formatWhen } from '../../src/utils/format'
import { summarySentence } from '../../src/utils/metrics'

const PLANS = [
  { key: 'BASIC', name: 'Básico', priceKey: 'basicPrice', regularKey: 'regularBasicPrice', features: ['Visitas, contactos, pedidos y reservas', 'Velocidad de tu web', 'Últimos 30 días, en palabras simples'] },
  { key: 'PRO', name: 'Pro', priceKey: 'proPrice', regularKey: 'regularProPrice', features: ['Todo lo del Básico', 'Páginas más vistas y de dónde llegan', 'Celular o computadora', 'Contactos mes a mes (12 meses)'] },
]

// Métricas DEVUTEC de la web del cliente (igual que en la web): el cliente activa con su consentimiento, ve su panel,
// elige su plan y comparte su reporte; el estudiante ve «Cómo integrarlo». El reporte Pro sale de Amplitude.
export default function ContractMetricsScreen() {
  const { id, tab: initialTab } = useLocalSearchParams()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const { user } = useAuth()
  const contract = useContract(id)
  const loaded = useAsync((options) => metricsService.get(id, options), [id])
  const [fresh, setFresh] = useState(null)
  const [tab, setTab] = useState(initialTab === 'integrar' ? 'integrar' : 'panel')
  const [busy, setBusy] = useState(null)
  const [consent, setConsent] = useState(false)
  const [pendingSession, setPendingSession] = useState(null)
  const [message, setMessage] = useState(null)
  const data = fresh ?? loaded.data

  if (loaded.loading || contract.loading || loaded.error || contract.error) {
    return (
      <ScreenState
        loading={loaded.loading || contract.loading}
        error={loaded.error ?? contract.error}
        onRetry={() => {
          loaded.reload()
          contract.reload()
        }}
      />
    )
  }

  const isClient = user?.id === contract.data.clientId
  const freelancer = contract.data.freelancerName?.split(' ')[0] ?? 'el estudiante'
  const access = data.access ?? {}

  const act = async (key, request, okText) => {
    setBusy(key)
    setMessage(null)
    try {
      const result = await request()
      if (result) setFresh(result)
      if (okText) setMessage({ ok: true, text: okText })
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(null)
    }
  }

  const subscribe = (plan) =>
    act(plan, async () => {
      const { sessionId, checkoutUrl } = await metricsService.subscribe(id, plan)
      setPendingSession(sessionId)
      await Linking.openURL(checkoutUrl)
      return null
    })

  const verify = () =>
    act('verify', () => metricsService.confirmSubscription(id, pendingSession), 'Listo: tu plan quedó activo.').then(() =>
      setPendingSession(null),
    )

  const disable = async () => {
    const ok = await confirmAlert(
      '¿Desactivar las métricas?',
      'Dejamos de contar las visitas de tu web y se borran los datos guardados. Puedes activarlas de nuevo cuando quieras.',
      'Desactivar',
    )
    if (ok) act('disable', () => metricsService.disable(id), 'Métricas desactivadas.')
  }

  // En la app el reporte se comparte como texto (WhatsApp, correo, notas). El PDF se descarga desde la web.
  const shareReport = () => {
    const s = data.summary
    if (!s) return
    Share.share({
      message: [
        `Métricas DEVUTEC · ${contract.data.projectTitle}`,
        data.allowedOrigin ?? '',
        summarySentence(s),
        `Visitas: ${s.visits} · Contactos: ${s.contacts} · Pedidos: ${s.orders} · Reservas: ${s.reservations}`,
        s.averageLoadMs ? `Carga promedio: ${(s.averageLoadMs / 1000).toFixed(1)} s` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }).catch(() => {})
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            setFresh(null)
            loaded.reload()
          }}
        />
      }
    >
      <Stack.Screen options={{ headerShown: true, headerTransparent: false, title: 'Métricas' }} />
      <Text style={styles.kicker}>MÉTRICAS DE LA WEB</Text>
      <Text style={styles.h1}>{contract.data.projectTitle}</Text>
      {message ? <Text style={[styles.message, message.ok ? styles.ok : styles.bad]}>{message.text}</Text> : null}

      {!data.enabled ? (
        <View style={styles.card}>
          {isClient && data.canManage ? (
            <>
              <Text style={styles.title}>Mira cuántas personas visitan tu web y cuántas te contactan</Text>
              <Text style={styles.text}>
                {freelancer} deja instalada una línea de código en tu web y tú ves tus números aquí, en palabras simples. Los 3 primeros
                meses son gratis y empiezan cuando llega la primera visita real.
              </Text>
              <Pressable
                onPress={() => setConsent((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consent }}
                style={styles.consent}
              >
                <Ionicons name={consent ? 'checkbox' : 'square-outline'} size={22} color={consent ? colors.text : colors.muted} />
                <Text style={styles.consentText}>{data.consentText}</Text>
              </Pressable>
              <PrimaryButton
                title={busy === 'enable' ? 'Activando…' : 'Activar métricas'}
                loading={busy === 'enable'}
                disabled={!consent}
                onPress={() => act('enable', () => metricsService.enable(id), 'Métricas activadas.')}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>El cliente todavía no activa las métricas</Text>
              <Text style={styles.text}>
                {data.requested
                  ? 'Las pidió al crear el proyecto. Cuando dé su consentimiento, aquí te aparecerá el código para integrarlas. Es un requisito de la Entrega final.'
                  : 'Cuando las active, aquí te aparecerá el código para integrarlas en la web.'}
              </Text>
            </>
          )}
        </View>
      ) : (
        <>
          <View style={styles.tabs}>
            {[
              ['panel', 'Panel'],
              ['integrar', 'Cómo integrarlo'],
            ].map(([key, label]) => (
              <Pressable key={key} onPress={() => setTab(key)} accessibilityRole="tab" accessibilityState={{ selected: tab === key }} style={[styles.tab, tab === key && styles.tabOn]}>
                <Text style={[styles.tabText, tab === key && styles.tabTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'panel' ? (
            <>
              <View style={styles.card}>
                <Text style={styles.small}>
                  {data.integrated ? `Conectada · último dato ${formatWhen(data.lastEventAt)}` : 'Esperando la primera visita de la web'}
                </Text>
                {data.summary ? (
                  <>
                    <Text style={styles.title}>{summarySentence(data.summary)}</Text>
                    <View style={styles.stats}>
                      {[
                        ['Contactos', data.summary.contacts],
                        ['Visitas', data.summary.visits],
                        ['Pedidos y reservas', data.summary.orders + data.summary.reservations],
                        ['Carga', data.summary.averageLoadMs ? `${(data.summary.averageLoadMs / 1000).toFixed(1)} s` : '—'],
                      ].map(([label, value]) => (
                        <View key={label} style={styles.stat}>
                          <Text style={styles.statLabel}>{label}</Text>
                          <Text style={styles.statValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                    <Bars days={data.summary.lastDays ?? []} />
                    {data.summary.includesTestData ? <Text style={styles.small}>Incluye datos de prueba (localhost o links de vista previa).</Text> : null}
                    {isClient ? <PrimaryButton title="Compartir reporte" variant="secondary" onPress={shareReport} /> : null}
                  </>
                ) : (
                  <Text style={styles.text}>Tu prueba gratis terminó. Elige un plan para volver a ver tus números.</Text>
                )}
              </View>

              {access.plan === 'PRO' ? <ProReport contractId={id} /> : null}

              {isClient ? (
                <View style={styles.card}>
                  <Text style={styles.kicker}>TU PLAN</Text>
                  <Text style={styles.text}>
                    {access.trialEndsAt
                      ? access.trialActive
                        ? `Tu prueba gratis dura hasta el ${formatDate(access.trialEndsAt)}. Si eliges un plan ahora, el primer cobro es recién ese día.`
                        : 'Tu prueba gratis terminó. Elige un plan para volver a ver tus números.'
                      : 'Tus 3 meses gratis empiezan cuando llegue la primera visita de tu web.'}
                  </Text>
                  {access.additionalSiteDiscount ? (
                    <Text style={styles.discount}>Precio de web adicional: como ya pagas el plan de otra web, esta te cuesta 25 % menos.</Text>
                  ) : null}
                  {PLANS.map((plan) => {
                    const current = access.plan === plan.key
                    return (
                      <View key={plan.key} style={[styles.plan, current && styles.planOn]}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planPrice}>
                          {formatBudget(access[plan.priceKey])} <Text style={styles.small}>al mes</Text>
                          {access.additionalSiteDiscount && access[plan.regularKey] != null ? (
                            <Text style={styles.strike}>  {formatBudget(access[plan.regularKey])}</Text>
                          ) : null}
                        </Text>
                        {plan.features.map((feature) => (
                          <Text key={feature} style={styles.small}>
                            · {feature}
                          </Text>
                        ))}
                        {current ? (
                          <Text style={styles.current}>Es tu plan actual ✓</Text>
                        ) : (
                          <PrimaryButton
                            title={busy === plan.key ? 'Abriendo Stripe…' : `Elegir ${plan.name}`}
                            loading={busy === plan.key}
                            disabled={busy !== null}
                            variant={plan.key === 'PRO' ? 'primary' : 'secondary'}
                            onPress={() => subscribe(plan.key)}
                          />
                        )}
                      </View>
                    )
                  })}
                  {pendingSession ? (
                    <PrimaryButton title="Ya pagué, verificar" loading={busy === 'verify'} onPress={verify} />
                  ) : null}
                  <Text style={styles.small}>Modo de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC</Text>
                </View>
              ) : null}

              {isClient && data.canManage ? (
                <Pressable onPress={disable} accessibilityRole="button" style={styles.disable}>
                  <Text style={styles.disableText}>{busy === 'disable' ? 'Desactivando…' : 'Desactivar métricas y borrar los datos'}</Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <Integration data={data} isClient={isClient} freelancer={freelancer} />
          )}
        </>
      )}
    </ScrollView>
  )
}

// Visitas por día (últimas 2 semanas) como barras simples
function Bars({ days }) {
  const styles = useThemedStyles(createStyles)
  const last = days.slice(-14)
  if (last.length === 0) return null
  const max = Math.max(1, ...last.map((day) => day.visits))
  return (
    <View>
      <Text style={styles.statLabel}>Visitas por día (últimas 2 semanas)</Text>
      <View style={styles.bars} accessibilityLabel={`Visitas por día: ${last.map((d) => d.visits).join(', ')}`}>
        {last.map((day) => (
          <View key={day.date} style={styles.barSlot}>
            <View style={[styles.bar, { height: `${Math.max(4, (day.visits / max) * 100)}%` }]} />
          </View>
        ))}
      </View>
    </View>
  )
}

Bars.propTypes = {
  days: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, visits: PropTypes.number })).isRequired,
}

// Reporte Pro (Amplitude): páginas más vistas, de dónde llegan, dispositivo y contactos por mes
function ProReport({ contractId }) {
  const styles = useThemedStyles(createStyles)
  const report = useAsync((options) => metricsService.advanced(contractId, options), [contractId])
  if (report.loading) return null
  if (report.error || !report.data?.available) {
    return <Text style={styles.text}>{report.data?.message ?? report.error ?? 'El reporte Pro no está disponible ahora.'}</Text>
  }
  const lists = [
    ['PÁGINAS MÁS VISTAS', report.data.topPages],
    ['DE DÓNDE LLEGAN', report.data.sources],
    ['CELULAR O COMPUTADORA', report.data.devices],
    ['CONTACTOS MES A MES', report.data.contactsByMonth],
  ]
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>REPORTE PRO</Text>
      {lists.map(([title, items]) => (
        <View key={title} style={styles.proList}>
          <Text style={styles.statLabel}>{title}</Text>
          {(items ?? []).length === 0 ? <Text style={styles.small}>Todavía no hay datos.</Text> : null}
          {(items ?? []).map((item) => (
            <View key={item.label} style={styles.proRow}>
              <Text style={styles.proLabel} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.proValue}>{item.total}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

ProReport.propTypes = { contractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired }

// «Cómo integrarlo»: la línea para la web, el prompt para la IA y el ejemplo de la API. En la app se comparten
// (por ejemplo, a la compu por WhatsApp o correo) para pegarlos en el código.
function Integration({ data, isClient, freelancer }) {
  const styles = useThemedStyles(createStyles)
  const integration = data.integration ?? {}
  const share = (text) => Share.share({ message: text }).catch(() => {})
  const steps = [
    ['Pega esta línea en la web', integration.scriptTag, 'Compartir el código'],
    ['¿Usas IA para programar? Pásale este prompt', integration.aiPrompt, 'Compartir el prompt'],
    ['¿Es una app o una automatización? Usa la API', integration.postExample, 'Compartir el ejemplo'],
  ]
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{isClient ? `Esto lo instala ${freelancer} en tu web` : 'Conecta la web en 2 minutos'}</Text>
      <Text style={styles.text}>
        Es como un Google Analytics de DEVUTEC: cuenta visitas, contactos, pedidos, reservas y la velocidad, y el cliente lo ve en su
        panel. No usa cookies ni guarda datos personales.
      </Text>
      <Text style={[styles.status, data.integrated ? styles.ok : styles.wait]}>
        {data.integrated ? `Integrada · último dato ${formatWhen(data.lastEventAt)}` : 'Esperando el primer dato…'}
      </Text>
      {steps.map(([title, code, label], index) =>
        code ? (
          <View key={title} style={styles.step}>
            <Text style={styles.planName}>
              {index + 1}. {title}
            </Text>
            <Text style={styles.code} numberOfLines={6} selectable>
              {code}
            </Text>
            <PrimaryButton title={label} variant="secondary" onPress={() => share(code)} />
          </View>
        ) : null,
      )}
      <Text style={styles.small}>Marca los botones importantes con data-devutec=&quot;contacto&quot;, &quot;pedido&quot; o &quot;reserva&quot;, publica la web y ábrela una vez.</Text>
    </View>
  )
}

Integration.propTypes = {
  data: PropTypes.shape({ integration: PropTypes.object, integrated: PropTypes.bool, lastEventAt: PropTypes.string }).isRequired,
  isClient: PropTypes.bool,
  freelancer: PropTypes.string,
}

const createStyles = ({ colors, fonts }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  kicker: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.3, color: colors.muted },
  h1: { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.5, color: colors.text },
  title: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 23, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 10 },
  message: { fontFamily: fonts.regular, fontSize: 13, borderRadius: 10, padding: 10, overflow: 'hidden' },
  ok: { color: colors.accent, backgroundColor: colors.card },
  bad: { color: colors.error, backgroundColor: colors.errorLight },
  wait: { color: colors.pending, backgroundColor: colors.pendingLight },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12 },
  consentText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.text },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 999, borderWidth: 1, borderColor: colors.border, padding: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  tabOn: { backgroundColor: colors.text },
  tabText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  tabTextOn: { color: colors.background },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.background, borderRadius: 14, padding: 12 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
  statValue: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginTop: 2 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 3, marginTop: 6 },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: colors.accent, borderRadius: 3 },
  discount: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accent, backgroundColor: colors.background, borderRadius: 10, padding: 8, overflow: 'hidden' },
  plan: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, gap: 4 },
  planOn: { borderColor: colors.accent },
  planName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  planPrice: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  strike: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textDecorationLine: 'line-through' },
  current: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accent, marginTop: 4 },
  disable: { alignItems: 'center', padding: 8 },
  disableText: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, textDecorationLine: 'underline' },
  proList: { gap: 4 },
  proRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  proLabel: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  proValue: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  status: { fontFamily: fonts.semibold, fontSize: 13, borderRadius: 10, padding: 8, overflow: 'hidden' },
  step: { gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  code: { fontFamily: fonts.regular, fontSize: 12, color: colors.text, backgroundColor: colors.background, borderRadius: 10, padding: 10 },
})
