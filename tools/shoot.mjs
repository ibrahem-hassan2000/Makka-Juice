/**
 * QA screenshots of the running dev site through headless Chrome (works while no browser window is visible).
 *   node tools/shoot.mjs <out-dir> <width>x<height> <shot>…
 * A shot is `name@y` where y is a scroll position: px, `#id` (top of an element), `#id+0.5` (… plus a
 * fraction of the viewport per unit, handy inside pinned sections), or `hero:0.42` (progress of the hero pin).
 * Phones (width < 768) are emulated as touch devices with DPR 2.
 * `name@y*N` takes a burst of N frames (~every 100 ms) right after scrolling — for timed animations.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const [out, size, ...shots] = process.argv.slice(2)
const [W, H] = size.split('x').map(Number)
const mobile = W < 768
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9334
const URL = process.env.SITE ?? 'http://localhost:5190/'
mkdirSync(out, { recursive: true })

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'makka-shoot-profile')}`,
  '--hide-scrollbars', '--no-first-run', `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200)
  try {
    target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page')
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let id = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  } else if (m.method === 'Runtime.exceptionThrown') console.log('  [page error]', m.params.exceptionDetails.exception?.description?.split('\n')[0])
  else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type))
    console.log(`  [${m.params.type}]`, m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300))
})
const send = (method, params = {}, ms = 20000) =>
  new Promise((res) => {
    const i = ++id
    const t = setTimeout(() => { pending.delete(i); console.log(`  [timeout] ${method}`); res({}) }, ms)
    pending.set(i, (m) => { clearTimeout(t); res(m) })
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value

try {
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: mobile ? 2 : 1, mobile })
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  await send('Page.navigate', { url: URL })
  console.log('navigated')
  for (let i = 0; i < 100; i++) {
    await sleep(300)
    if (await evaluate(`(async () => (await import('/src/lib/lenis.ts')).isReady())()`)) break
  }
  console.log('ready')
  await sleep(1800)
  for (const shot of shots) {
    const [name, whereRaw] = shot.split('@')
    const [where, burst] = whereRaw.split('*')
    const y = await evaluate(`(() => {
      const w = ${JSON.stringify(where)}
      if (w.startsWith('hero:')) return parseFloat(w.slice(5)) * innerHeight * 4.2
      if (w.startsWith('#')) {
        const [sel, add] = w.split('+')
        const el = document.querySelector(sel)
        return el.getBoundingClientRect().top + scrollY + (add ? parseFloat(add) * innerHeight : 0)
      }
      return parseFloat(w)
    })()`)
    await evaluate(`(async () => { const { getLenis } = await import('/src/lib/lenis.ts'); getLenis()?.scrollTo(${y}, { immediate: true, force: true }); window.scrollTo(0, ${y}) })()`)
    if (burst) {
      const t0 = Date.now()
      for (let i = 0; i < Number(burst); i++) {
        const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 })
        writeFileSync(join(out, `${name}-${String(i).padStart(2, '0')}.jpg`), Buffer.from(r.result.data, 'base64'))
        await sleep(40)
      }
      console.log(`${name} burst of ${burst} over ${Date.now() - t0} ms`)
      continue
    }
    await sleep(2200)
    const shotRes = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(out, `${name}.png`), Buffer.from(shotRes.result.data, 'base64'))
    console.log(`${name} @ ${Math.round(y)}`)
  }
} finally {
  ws.close()
  chrome.kill()
}
