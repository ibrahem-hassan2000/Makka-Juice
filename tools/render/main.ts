/**
 * Render studio entry. Open http://localhost:5190/tools/render/ in dev to preview,
 * or run `node tools/render/run.mjs [names…]` to write the sprites into src/assets/render/.
 */
import { capture, crop, type Shot } from './studio'
import { FRUITS } from './fruits'
import { CUPS, DROPS, heroPasses } from './cup'
import { TRIPO } from './tripo'
import { exportGLBs } from './glb'

type Job = { name: string; build: () => import('three').Object3D | Promise<import('three').Object3D>; shot: Shot }

const FRUIT_SHOT: Shot = { width: 384, height: 384, pitch: 10, margin: 0.05 }

const JOBS: Job[] = [
  ...Object.entries(FRUITS).filter(([name]) => name !== 'ice').map(([name, build]) => ({ name, build, shot: FRUIT_SHOT })),
  ...CUPS,
  ...DROPS,
  ...TRIPO,
]

async function run(names?: string[], sheet = true) {
  await document.fonts.load('800 120px "Baloo Bhaijaan 2 Variable"', 'لو عصير يبقى مكة')
  await document.fonts.ready
  const out: Array<{ name: string; webp: string; w: number; h: number }> = []
  const canvases: Array<[string, HTMLCanvasElement]> = []
  for (const job of JOBS) {
    if (names?.length && !names.some((n) => job.name === n || job.name.startsWith(n + '-'))) continue
    const t0 = performance.now()
    const c = capture(await job.build(), job.shot).canvas
    console.log(`rendered ${job.name} in ${Math.round(performance.now() - t0)} ms`)
    out.push({ name: job.name, webp: c.toDataURL('image/webp', 0.9), w: c.width, h: c.height })
    canvases.push([job.name, c])
  }
  let meta: unknown = null
  if (!names?.length || names.includes('hero')) {
    const t0 = performance.now()
    const h = await heroPasses(capture, crop)
    console.log(`rendered hero passes in ${Math.round(performance.now() - t0)} ms`)
    for (const o of h.outs) {
      out.push({ name: o.name, webp: o.canvas.toDataURL('image/webp', 0.9), w: o.canvas.width, h: o.canvas.height })
      canvases.push([o.name, o.canvas])
    }
    meta = h.meta
  }
  let glbs: Array<{ name: string; data: string }> = []
  if (names?.includes('glb')) glbs = await exportGLBs()
  let contact = ''
  if (sheet && canvases.length) {
    // contact sheet: every sprite over cream and forest so edges/alpha can be judged
    const cell = 300, cols = Math.min(4, canvases.length)
    const rows = Math.ceil(canvases.length / cols)
    const s = document.createElement('canvas')
    s.width = cols * cell * 2
    s.height = rows * (cell + 24)
    const g = s.getContext('2d')!
    g.fillStyle = '#222'
    g.fillRect(0, 0, s.width, s.height)
    canvases.forEach(([name, c], i) => {
      const x = (i % cols) * cell * 2, y = Math.floor(i / cols) * (cell + 24)
      for (const [k, bg] of [['#fff8e7', 0], ['#46a843', 1]] as const) {
        g.fillStyle = k
        g.fillRect(x + (bg as number) * cell, y, cell, cell)
        const sc = Math.min(cell / c.width, cell / c.height)
        g.drawImage(c, x + (bg as number) * cell + (cell - c.width * sc) / 2, y + (cell - c.height * sc) / 2, c.width * sc, c.height * sc)
      }
      g.fillStyle = '#fff'
      g.font = '16px sans-serif'
      g.fillText(name, x + 8, y + cell + 17)
    })
    contact = s.toDataURL('image/png')
  }
  return { out, contact, meta, glbs }
}

declare global {
  interface Window {
    renderAll: typeof run
  }
}
window.renderAll = run

// manual preview when opened in a browser tab
if (!navigator.webdriver && location.search.includes('preview')) {
  const names = new URLSearchParams(location.search).get('only')?.split(',')
  run(names).then(({ contact }) => {
    const img = new Image()
    img.src = contact
    img.style.maxWidth = '100%'
    document.body.append(img)
  })
}
