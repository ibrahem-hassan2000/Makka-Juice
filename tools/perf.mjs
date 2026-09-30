/**
 * Performance probe for the running dev (or preview) site, through headless Chrome.
 *   node tools/perf.mjs [width]x[height] [cpuSlowdown]      e.g.  node tools/perf.mjs 390x844 4
 * Emulates a phone (touch, DPR 2) with a throttled CPU, swipes down the whole page with real touch gestures and
 * reports, per section: frames, slow frames, worst frame, and the scripts behind long animation frames (LoAF).
 * Also reports what keeps animating while nobody scrolls, and the compositing layers (count + memory).
 * Env: SITE=http://localhost:4173/ to probe the production preview instead of dev.
 */
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const [size = '390x844', slow = '4'] = process.argv.slice(2)
const [W, H] = size.split('x').map(Number)
const mobile = W < 768
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9335
const URL = process.env.SITE ?? 'http://localhost:5190/'

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'makka-perf-profile')}`,
  '--hide-scrollbars', '--no-first-run', `--window-size=${W},${H}`, ...(process.env.GPU ? ['--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--enable-zero-copy'] : []), 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200)
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page') } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let id = 0
const pending = new Map()
const events = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  else if (m.method === 'LayerTree.layerTreeDidChange') events.push(m.params)
  else if (m.method === 'Runtime.exceptionThrown') console.log('  [page error]', m.params.exceptionDetails.exception?.description?.split('\n')[0])
})
const send = (method, params = {}, ms = 120000) => new Promise((res) => {
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
  for (let i = 0; i < 120; i++) {
    await sleep(300)
    if (await evaluate(`!!document.querySelector('#top') && document.fonts.status === 'loaded' && performance.now() > 2500`)) break
  }
  // wait for the preloader to hand the scroll back
  for (let i = 0; i < 60; i++) {
    await sleep(250)
    if (await evaluate(`document.documentElement.style.overflow !== 'hidden' && performance.now() > 4000`)) break
  }
  await sleep(800)
  // experiments: INJECT_CSS='…' adds a stylesheet before measuring
  if (process.env.INJECT_CSS) await evaluate(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(process.env.INJECT_CSS)}; document.head.append(s) })()`)
  await send('Emulation.setCPUThrottlingRate', { rate: Number(slow) })

  // observers: frames (rAF) + long animation frames with script attribution
  await evaluate(`(() => {
    const sections = [...document.querySelectorAll('section, footer')]
    const where = () => {
      const mid = innerHeight / 2
      for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom >= mid) return s.id || s.getAttribute('aria-label') || s.tagName }
      return '?'
    }
    window.__perf = { frames: [], loaf: [] }
    let last = performance.now()
    const tick = (t) => { window.__perf.frames.push([t - last, where()]); last = t; if (window.__perf.on !== false) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.loaf.push({
        at: where(), dur: e.duration, block: e.blockingDuration,
        style: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0,
        scripts: e.scripts.map((s) => ({ d: s.duration, fsl: s.forcedStyleAndLayoutDuration, src: (s.sourceURL || '').split('/').slice(-2).join('/').split('?')[0], fn: s.sourceFunctionName, inv: s.invoker })),
      })
    }).observe({ type: 'long-animation-frame', buffered: false })
  })()`)

  // swipe down the whole page like a thumb
  const total = await evaluate('document.documentElement.scrollHeight')
  const gpu = await evaluate(`(() => { const g = document.createElement('canvas').getContext('webgl'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a' })()`)
  console.log(`page height ${total}px, viewport ${W}x${H}, CPU ÷${slow}, GPU: ${gpu}`)
  let y = 0
  while (y < total - H) {
    await send('Input.synthesizeScrollGesture', { x: Math.round(W / 2), y: Math.round(H * 0.7), yDistance: -Math.round(H * 0.6), speed: 1400, gestureSourceType: 'mouse' }) // synthetic touch scrolls don't move headless pages
    await sleep(250)
    const ny = await evaluate('scrollY')
    if (ny <= y + 5) break
    y = ny
  }
  await sleep(1500)
  const perf = JSON.parse(await evaluate('JSON.stringify(window.__perf)'))

  // what keeps moving on its own: CSS/WAAPI animations running + active GSAP tweens, then 3 s of idle frames
  const idle = await evaluate(`(async () => {
    const running = document.getAnimations().filter((a) => a.playState === 'running')
    const byTarget = running.slice(0, 40).map((a) => {
      const el = a.effect?.target
      return (a.animationName || a.constructor.name) + ' ← ' + (el ? el.tagName.toLowerCase() + '.' + String(el.className?.baseVal ?? el.className).split(' ').slice(0, 3).join('.') : '?')
    })
    let gsapActive = 0
    try { const { gsap } = await import('/src/lib/gsap.ts'); gsapActive = gsap.globalTimeline.getChildren(true, true, false).filter((t) => t.isActive()).length } catch {}
    window.__perf.frames = []
    await new Promise((r) => setTimeout(r, 3000))
    const f = window.__perf.frames
    return { runningAnimations: running.length, examples: byTarget, gsapActive, idleFrames: f.length }
  })()`)

  // layers, sampled at a few places down the page
  await send('Emulation.setCPUThrottlingRate', { rate: 1 })
  await send('DOM.getDocument', { depth: 0 })
  await send('LayerTree.enable')
  const layerReport = []
  for (const at of [0, 0.25, 0.45, 0.65, 0.85]) {
    await evaluate(`window.scrollTo(0, ${Math.round(at * (total - H))})`)
    await sleep(1500)
    const snap = events.at(-1)?.layers ?? []
    const drawn = snap.filter((l) => l.drawsContent)
    const mem = drawn.reduce((s, l) => s + l.width * l.height * 4 * (mobile ? 4 : 1), 0)
    const big = [...drawn].sort((a, b) => b.width * b.height - a.width * a.height).slice(0, 8)
    const names = []
    for (const l of big) {
      let name = '?'
      if (l.backendNodeId) {
        const d = (await send('DOM.describeNode', { backendNodeId: l.backendNodeId })).result?.node
        if (d) {
          const a = d.attributes ?? []
          const ci = a.indexOf('class')
          name = d.localName + (ci >= 0 ? '.' + a[ci + 1].split(' ').slice(0, 4).join('.') : '')
        }
      }
      const why = (await send('LayerTree.compositingReasons', { layerId: l.layerId })).result?.compositingReasonIds ?? []
      names.push(`${Math.round(l.width)}×${Math.round(l.height)}  ${name.slice(0, 70)}  [${why.join(', ')}]`)
    }
    layerReport.push({ at, count: drawn.length, mem, names })
  }

  // report
  console.log('\n— idle (no scrolling, 3 s) —')
  console.log(`running CSS/WAAPI animations: ${idle.runningAnimations}   active GSAP tweens: ${idle.gsapActive}   frames painted in 3 s: ${idle.idleFrames}`)
  idle.examples.forEach((e) => console.log('   ', e))
  for (const l of layerReport) {
    console.log(`\n— layers at ${Math.round(l.at * 100)} % of the page — ${l.count} drawing layers, ~${(l.mem / 1048576).toFixed(0)} MB backing store; biggest:`)
    l.names.forEach((n) => console.log('    ', n))
  }
  console.log('\n— scrolling, by section (frame ms) —')
  const by = {}
  for (const [d, s] of perf.frames) (by[s] ??= []).push(d)
  for (const [s, arr] of Object.entries(by)) {
    const sorted = [...arr].sort((a, b) => a - b)
    const slowN = arr.filter((d) => d > 34).length
    console.log(`${s.padEnd(14)} frames ${String(arr.length).padStart(4)}  median ${sorted[sorted.length >> 1].toFixed(1).padStart(5)}  p95 ${sorted[Math.floor(sorted.length * 0.95)].toFixed(1).padStart(6)}  max ${sorted.at(-1).toFixed(0).padStart(5)}  >34ms ${slowN}`)
  }
  console.log('\n— long animation frames: top scripts —')
  const agg = {}
  for (const l of perf.loaf) for (const s of l.scripts) {
    const k = `${l.at} | ${s.src}:${s.fn || '?'} (${s.inv})`
    agg[k] ??= { n: 0, d: 0, fsl: 0 }
    agg[k].n++; agg[k].d += s.d; agg[k].fsl += s.fsl
  }
  Object.entries(agg).sort((a, b) => b[1].d - a[1].d).slice(0, 25).forEach(([k, v]) => console.log(`${v.d.toFixed(0).padStart(6)} ms  ×${String(v.n).padStart(3)}  forced-layout ${v.fsl.toFixed(0).padStart(4)}  ${k}`))
  const styleTot = {}
  for (const l of perf.loaf) styleTot[l.at] = (styleTot[l.at] ?? 0) + l.style
  console.log('\n— style + layout time inside long frames, by section —')
  Object.entries(styleTot).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`${v.toFixed(0).padStart(6)} ms  ${k}`))
} finally {
  ws.close()
  chrome.kill()
}
