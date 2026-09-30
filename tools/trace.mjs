/**
 * Where does frame time go? Records a Chrome trace while scrolling through one section and sums the time per
 * event type (paint, raster, style, layout, GPU…).
 *   node tools/trace.mjs "#story" 390x844 [cpuSlowdown]      (GPU=1 to use the real GPU; SITE=… to pick the server)
 */
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const [sel = '#story', size = '390x844', slow = '1'] = process.argv.slice(2)
const [W, H] = size.split('x').map(Number)
const mobile = W < 768
const PORT = 9337
const chrome = spawn(process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'makka-trace-profile')}`, '--hide-scrollbars',
  `--window-size=${W},${H}`, ...(process.env.GPU ? ['--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] : []), 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let t
for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((x) => x.type === 'page') } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let id = 0
const P = new Map()
const trace = []
let traceDone
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && P.has(m.id)) { P.get(m.id)(m); P.delete(m.id) }
  else if (m.method === 'Tracing.dataCollected') trace.push(...m.params.value)
  else if (m.method === 'Tracing.tracingComplete') traceDone?.()
})
const send = (method, params = {}) => new Promise((res) => { const i = ++id; P.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value
try {
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: mobile ? 2 : 1, mobile })
  await send('Page.navigate', { url: process.env.SITE ?? 'http://localhost:4173/' })
  for (let i = 0; i < 60; i++) { await sleep(250); if (await ev(`document.documentElement.style.overflow !== 'hidden' && performance.now() > 4000`)) break }
  const y0 = await ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return Math.round(r.top + scrollY - innerHeight * 0.6) })()`)
  const h = await ev(`document.querySelector(${JSON.stringify(sel)}).offsetHeight`)
  await ev(`window.scrollTo(0, ${y0})`)
  await sleep(1500)
  await send('Emulation.setCPUThrottlingRate', { rate: Number(slow) })
  await send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking,cc,gpu,viz,blink,benchmark', transferMode: 'ReportEvents' })
  const steps = Math.max(3, Math.round((h + H * 0.6) / (H * 0.5)))
  for (let i = 0; i < steps; i++) {
    await send('Input.synthesizeScrollGesture', { x: Math.round(W / 2), y: Math.round(H * 0.6), yDistance: -Math.round(H * 0.5), speed: 1200, gestureSourceType: 'mouse' })
    await sleep(120)
  }
  await sleep(800)
  const done = new Promise((r) => (traceDone = r))
  await send('Tracing.end')
  await done
  // sum complete events by name (per thread type)
  const threads = {}
  for (const e of trace) if (e.ph === 'M' && e.name === 'thread_name') threads[`${e.pid}:${e.tid}`] = e.args.name
  const sum = {}
  for (const e of trace) {
    if (e.ph !== 'X' || !e.dur) continue
    const th = threads[`${e.pid}:${e.tid}`] ?? '?'
    const k = `${th.replace(/\d+$/, '').slice(0, 22).padEnd(22)} ${e.name}`
    sum[k] = (sum[k] ?? 0) + e.dur / 1000
  }
  const frames = trace.filter((e) => e.name === 'DrawFrame' || e.name === 'Graphics.Pipeline').length
  console.log(`${sel} @ ${size} CPU÷${slow} — ${steps} scroll steps, ${frames} frame events`)
  Object.entries(sum).sort((a, b) => b[1] - a[1]).slice(0, Number(process.env.TOP ?? 14)).forEach(([k, v]) => console.log(`${v.toFixed(0).padStart(7)} ms  ${k}`))
  // who gets repainted, and why
  const inv = {}
  for (const e of trace) {
    if (!/Invalidation/.test(e.name)) continue
    const d = e.args?.data ?? {}
    const k = `${e.name.replace('Tracking', '')} · ${d.reason ?? ''} · ${(d.nodeName ?? '').slice(0, 90)}`
    inv[k] = (inv[k] ?? 0) + 1
  }
  console.log('\n— invalidations (count · reason · node) —')
  Object.entries(inv).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(`${String(v).padStart(6)}  ${k}`))
} finally {
  ws.close()
  chrome.kill()
}
