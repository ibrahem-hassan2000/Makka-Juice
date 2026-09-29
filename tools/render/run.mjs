/**
 * Drives headless Chrome over the DevTools protocol: loads the studio from the Vite dev server,
 * renders the requested jobs and writes the WebP sprites to src/assets/render/ (+ a contact sheet).
 *   node tools/render/run.mjs                 → everything
 *   node tools/render/run.mjs strawberry cup  → only those (prefix match on "cup-…")
 * Env: SHEET=<path to write the contact sheet png>
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const outDir = join(root, 'src/assets/render')
const names = process.argv.slice(2)
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
const URL = process.env.STUDIO ?? 'http://localhost:5190/tools/render/index.html'

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'makka-render-profile')}`,
  '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--window-size=1200,900', '--no-first-run', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200)
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    target = list.find((t) => t.type === 'page')
  } catch {}
}
if (!target) throw new Error('chrome did not start')

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let id = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  } else if (msg.method === 'Runtime.consoleAPICalled') {
    console.log('  [page]', msg.params.args.map((a) => a.value ?? a.description).join(' '))
  } else if (msg.method === 'Runtime.exceptionThrown') {
    console.log('  [page error]', msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
  }
})
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const i = ++id
    pending.set(i, resolve)
    ws.send(JSON.stringify({ id: i, method, params }))
  })

try {
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: URL })
  // Vite may re-optimise deps and reload once — wait until the studio is really there
  let ready = false
  for (let i = 0; i < 150 && !ready; i++) {
    await sleep(300)
    const r = await send('Runtime.evaluate', { expression: 'typeof window.renderAll === "function"', returnByValue: true })
    ready = r.result?.result?.value === true
  }
  if (!ready) throw new Error('studio did not load')
  await sleep(500)
  const t0 = Date.now()
  const r = await send('Runtime.evaluate', {
    expression: `window.renderAll(${JSON.stringify(names)}).then(r => JSON.stringify(r))`,
    awaitPromise: true,
    returnByValue: true,
    timeout: 600000,
  })
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'render failed')
  const { out, contact, meta, glbs } = JSON.parse(r.result.result.value)
  mkdirSync(outDir, { recursive: true })
  for (const o of out) {
    const buf = Buffer.from(o.webp.split(',')[1], 'base64')
    writeFileSync(join(outDir, `${o.name}.webp`), buf)
    console.log(`${o.name}.webp  ${o.w}×${o.h}  ${(buf.length / 1024).toFixed(1)} KB`)
  }
  for (const g of glbs ?? []) {
    const dir = join(root, 'src/assets/models')
    mkdirSync(dir, { recursive: true })
    const buf = Buffer.from(g.data, 'base64')
    writeFileSync(join(dir, `${g.name}.glb`), buf)
    console.log(`${g.name}.glb  ${(buf.length / 1024).toFixed(0)} KB`)
  }
  if (meta) {
    writeFileSync(join(outDir, 'hero-cup.json'), JSON.stringify(meta, null, 2) + '\n')
    console.log('hero-cup.json')
  }
  if (contact && process.env.SHEET) writeFileSync(process.env.SHEET, Buffer.from(contact.split(',')[1], 'base64'))
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`)
} finally {
  ws.close()
  chrome.kill()
}
