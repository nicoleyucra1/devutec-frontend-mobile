import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { summarySentence } from './metrics'

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const DAY = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const TODAY = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

// HTML del reporte (siempre en claro, como para imprimir): resumen, 4 números y visitas por día
export function metricsReportHtml({ projectTitle, site, summary }) {
  const days = summary.lastDays ?? []
  const max = Math.max(1, ...days.map((day) => day.visits ?? 0))
  const bars = days
    .map((day) => {
      const height = Math.max(2, Math.round(((day.visits ?? 0) / max) * 140))
      const label = DAY.format(new Date(`${day.date}T00:00:00Z`))
      return `<div class="col"><div class="bar" style="height:${day.visits ? height : 0}px"></div><span>${esc(label)}</span></div>`
    })
    .join('')
  const stats = [
    ['CONTACTOS', summary.contacts],
    ['VISITAS', summary.visits],
    ['PEDIDOS Y RESERVAS', (summary.orders ?? 0) + (summary.reservations ?? 0)],
    ['CARGA PROMEDIO', summary.averageLoadMs ? `${(summary.averageLoadMs / 1000).toFixed(1)} s` : '—'],
  ]
    .map(([label, value]) => `<div class="stat"><small>${label}</small><b>${esc(value)}</b></div>`)
    .join('')

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0e0e0c;margin:36px}
    .kicker{font-size:11px;letter-spacing:.14em;font-weight:700;color:#1f6f4a}
    h1{font-size:26px;margin:6px 0 2px} .muted{color:#6f6d67;font-size:12px}
    .summary{font-size:19px;font-weight:600;margin:22px 0}
    .stats{display:flex;gap:10px} .stat{flex:1;border:1px solid #e4e0d8;border-radius:12px;padding:12px}
    .stat small{display:block;font-size:9px;letter-spacing:.12em;color:#6f6d67} .stat b{font-size:24px}
    h2{font-size:13px;margin:26px 0 10px} .chart{display:flex;align-items:flex-end;gap:3px;height:170px;border-bottom:1px solid #e4e0d8}
    .col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
    .bar{width:70%;max-width:18px;background:#1f6f4a;border-radius:4px 4px 0 0} .col span{font-size:7px;color:#6f6d67;margin-top:4px;white-space:nowrap}
    .foot{margin-top:28px;font-size:10px;color:#6f6d67}
  </style></head><body>
    <div class="kicker">DEVUTEC · REPORTE DE MÉTRICAS DE LA WEB</div>
    <h1>${esc(projectTitle)}</h1>
    <div class="muted">${site ? `${esc(site)} · ` : ''}Generado el ${esc(TODAY.format(new Date()))}</div>
    <p class="summary">${esc(summarySentence(summary))}</p>
    <div class="stats">${stats}</div>
    <h2>Visitas por día</h2>
    <div class="chart">${bars}</div>
    <p class="foot">Métricas anónimas: sin cookies ni datos personales. Cada visitante aceptó el aviso antes de contar.</p>
  </body></html>`
}

// Genera el PDF y abre el menú del celular para guardarlo o mandarlo (WhatsApp, correo, Drive)
export async function downloadMetricsPdf(report) {
  const { uri } = await Print.printToFileAsync({ html: metricsReportHtml(report) })
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Reporte de métricas' })
  }
  return uri
}
