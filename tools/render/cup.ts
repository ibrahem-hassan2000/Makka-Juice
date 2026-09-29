/**
 * The Makka cup in 3D: clear PET (real transmission), layered juice, the dark-green wave print +
 * «لو عصير / يبقى / مكة», whipped-cream swirl, pink straw, ice, garnish and a little condensation.
 * Proportions follow the SVG cup (components/art/Cup.tsx) so the sprites drop into the same layouts.
 */
import * as THREE from 'three'
import { SIGNATURES } from '../../src/data/signatures'
import { canvas, clamp01, fbm, hex, mix, noise3, paint, rng, smooth, tex, type RGB } from './tex'
import { phys, profile, profileAt, seg, sweep, wobble } from './parts'
import { ice, kiwi, mint, strawberry } from './fruits'
import type { Shot } from './studio'

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const TAU = Math.PI * 2

// SVG cup: rim y 110, bottom y 404, top width 252, bottom width 180 (viewBox 300×420)
export const CUP = { H: 2.33, Rt: 1, Rb: 0.714, fill: 0.9 }
const radiusAt = (y: number) => CUP.Rb + (CUP.Rt - CUP.Rb) * (y / CUP.H)
export const INK = '#0b4a2e'

function wallProfile(inset = 0, top = CUP.H) {
  const { Rb } = CUP
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.0005, inset)]
  // rounded bottom corner
  const nc = seg(8, 3)
  for (let i = 0; i <= nc; i++) {
    const a = (i / nc) * (Math.PI / 2)
    pts.push(new THREE.Vector2(Rb - 0.08 - inset + Math.sin(a) * 0.08, inset + 0.08 - Math.cos(a) * 0.08))
  }
  const nw = seg(40, 8)
  for (let i = 1; i <= nw; i++) {
    const y = inset + 0.08 + ((top - inset - 0.08) * i) / nw
    pts.push(new THREE.Vector2(radiusAt(y) - inset, y))
  }
  return pts
}

/* ---------- the print (wave lines + slogan) as a texture on a shell just outside the wall ---------- */
async function printTexture() {
  await document.fonts.load('800 120px "Baloo Bhaijaan 2 Variable"', 'لو عصير يبقى مكة')
  const W = 4096, Hh = 2048
  const c = canvas(W, Hh)
  const g = c.getContext('2d')!
  // shell spans y 0.06 → H-0.06; v = 0 at the bottom (canvas bottom)
  const y0 = 0.06, y1 = CUP.H - 0.06
  const toPx = (y: number) => Hh - ((y - y0) / (y1 - y0)) * Hh
  // horizontal: u = angle. px per world unit at a height = W / (2π r)
  const midR = radiusAt(CUP.H * 0.6)
  const pxPerUnitX = W / (TAU * midR)
  const pxPerUnitY = Hh / (y1 - y0)
  g.strokeStyle = INK
  g.fillStyle = INK
  g.lineCap = 'round'
  // six wave lines (SVG y 296..376 → 0.63..0.9 of the body below the rim)
  const svgToY = (sy: number) => CUP.H - ((sy - 110) / 294) * CUP.H
  const periods = 13
  for (const sy of [296, 312, 328, 344, 360, 376]) {
    const yc = toPx(svgToY(sy))
    const amp = (6 / 126) * pxPerUnitY
    g.lineWidth = (3.2 / 126) * pxPerUnitY
    g.beginPath()
    for (let x = 0; x <= W; x += 4) {
      const yy = yc + Math.sin((x / W) * periods * TAU) * amp
      if (x === 0) g.moveTo(x, yy)
      else g.lineTo(x, yy)
    }
    g.stroke()
  }
  // slogan centred on the front (u = 0.5 with the shell's phiStart = π)
  g.save()
  g.translate(W / 2, 0)
  g.scale(pxPerUnitX / pxPerUnitY, 1)
  g.direction = 'rtl'
  g.textAlign = 'center'
  g.textBaseline = 'alphabetic'
  const line = (text: string, sy: number, size: number) => {
    g.font = `800 ${(size / 126) * pxPerUnitY}px "Baloo Bhaijaan 2 Variable"`
    g.fillText(text, 0, toPx(svgToY(sy)))
  }
  line('لو عصير', 214, 30)
  line('يبقى', 246, 30)
  line('مكة', 280, 36)
  g.restore()
  const t = tex(c)
  t.wrapS = THREE.RepeatWrapping
  t.anisotropy = 16
  return t
}

/* ---------- liquid ---------- */
function liquidTexture(layers: string[], pts: THREE.Vector2[], top: number, seed: number, hard = false) {
  const cols = layers.map(hex)
  const r = rng(seed)
  const phase = layers.map(() => r() * TAU)
  const W = 1024, Hh = 1024
  const bottom = hard ? 0.018 : 0.03
  return paint(W, Hh, (u, v) => {
    const y = profileAt(pts, v).y
    const h = clamp01((y - bottom) / (top - bottom))
    const a = u * TAU
    // which layer: boundaries at k/n with a soft wavy edge
    let c: RGB = cols[0]
    for (let k = 1; k < cols.length; k++) {
      const edge = hard ? k / cols.length : k / cols.length + 0.018 * Math.sin(a * 2 + phase[k]) + 0.012 * noise3(Math.cos(a) * 3, Math.sin(a) * 3, k * 7)
      const soft = hard ? 0.002 : 0.012
      c = mix(c, cols[k], smooth(edge - soft, edge + soft, h))
    }
    const k = fbm(Math.cos(a) * 4, Math.sin(a) * 4, h * 9, 4)
    c = mix(c, mix(c, [0, 0, 0], 0.25), clamp01(-k) * 0.35)
    c = mix(c, mix(c, [1, 1, 1], 0.3), clamp01(k) * 0.15)
    // pulp flecks
    const fleck = smooth(0.42, 0.55, noise3(Math.cos(a) * 60, Math.sin(a) * 60, h * 110))
    c = mix(c, mix(c, [1, 0.95, 0.8], 0.5), fleck * 0.5)
    // tiny bubbles against the wall
    const bub = smooth(0.6, 0.66, noise3(Math.cos(a) * 140 + 9, Math.sin(a) * 140, h * 260))
    return mix(c, [1, 1, 1], bub * 0.7)
  })
}

/* ---------- whipped cream swirl ---------- */
function cream(baseY: number) {
  const turns = 2.35
  const curve = new (class extends THREE.Curve<THREE.Vector3> {
    getPoint(t: number, target = new THREE.Vector3()) {
      const a = t * turns * TAU
      const rho = 0.74 * (1 - t * 0.9)
      return target.set(Math.cos(a) * rho, baseY + 0.08 + t * 0.62 + 0.1 * Math.pow(t, 6), Math.sin(a) * rho)
    }
  })()
  const geo = sweep(
    curve,
    (t, a) => {
      const rc = (0.3 - 0.2 * t) * (t > 0.92 ? Math.sqrt(Math.max(0, 1 - (t - 0.92) / 0.08)) + 0.02 : 1)
      return rc * (1 + 0.13 * Math.cos(8 * a + t * 20))
    },
    { segs: 600, around: 64, up: V(0, 1, 0), minSegs: 420, minAround: 48 },
  )
  wobble(geo, 0.02, 3, 11)
  const mat = phys({
    color: '#fff8ea', roughness: 0.55, sheen: 0.8, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.5,
    emissive: new THREE.Color('#ffe9c8'), emissiveIntensity: 0.05,
    bumpMap: tex(paint(512, 512, (u, v) => 0.5 + fbm(u * 30, v * 30, 2, 3) * 0.3), false), bumpScale: 1.2,
  })
  // a soft base mound so the swirl sits on the drink, not floating
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.86, seg(96, 64), seg(48, 24), 0, TAU, 0, Math.PI / 2), mat)
  mound.scale.set(1, 0.34, 1)
  mound.position.y = baseY - 0.02
  wobble(mound.geometry, 0.04, 2, 5)
  const g = new THREE.Group()
  g.add(new THREE.Mesh(geo, mat), mound)
  return g
}

export interface CupOpts {
  layers: string[]
  garnish?: boolean
  straw?: boolean
  cream?: boolean
  ice?: boolean
  seed?: number
}

const LIQ_INSET = 0.018
const TOP = CUP.H * CUP.fill

/** wall + rim + print (+ condensation). `half` keeps only the half facing (front) or away from (back) the camera. */
async function cupShell(half?: 'front' | 'back', seed = 5) {
  const { H, Rt } = CUP
  const clip = half ? [new THREE.Plane(V(0, 0, half === 'front' ? 1 : -1), 0)] : undefined
  const grp = new THREE.Group()
  const plastic = phys({
    color: '#ffffff', transmission: 1, thickness: 0.04, ior: 1.46, roughness: 0.03, specularIntensity: 1,
    side: THREE.DoubleSide, clearcoat: 0.3, clearcoatRoughness: 0.03, clippingPlanes: clip,
  })
  const wall = new THREE.Mesh(new THREE.LatheGeometry(wallProfile(0), seg(200, 64)), plastic)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(Rt + 0.012, 0.034, seg(20, 8), seg(200, 64)), plastic)
  rim.rotation.x = Math.PI / 2
  rim.position.y = H
  wall.userData.noShadow = rim.userData.noShadow = true
  const shellPts = [new THREE.Vector2(radiusAt(0.06) + 0.004, 0.06), new THREE.Vector2(radiusAt(H - 0.06) + 0.004, H - 0.06)]
  const shell = new THREE.Mesh(
    new THREE.LatheGeometry(shellPts, seg(256, 64), Math.PI, TAU),
    phys({
      map: await printTexture(), transparent: true, roughness: 0.42, clearcoat: 0.3, depthWrite: false, clippingPlanes: clip,
      side: half === 'back' ? THREE.BackSide : THREE.FrontSide,
    }),
  )
  shell.userData.noShadow = true
  grp.add(wall, rim, shell)
  if (half !== 'back') {
    const r = rng(seed)
    const drops: THREE.Matrix4[] = []
    for (let i = 0; i < 70; i++) {
      const y = 0.15 + r() * (TOP - 0.4)
      const a = (r() - 0.5) * Math.PI * 1.2
      // keep the slogan readable: no drops on the printed words
      if (y > CUP.H * 0.36 && y < CUP.H * 0.76 && Math.abs(a) < 0.5) continue
      const rr = radiusAt(y) + 0.008
      const n = V(Math.sin(a), 0.3, Math.cos(a)).normalize()
      const sc = 0.01 + r() * r() * 0.022
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n)
      drops.push(new THREE.Matrix4().compose(V(rr * Math.sin(a), y, rr * Math.cos(a)), q, V(sc, sc * 1.25, sc * 0.55)))
    }
    const dropMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, seg(16, 6), seg(12, 4)),
      phys({ color: '#ffffff', transmission: 1, roughness: 0.02, ior: 1.33, thickness: 0.02, specularIntensity: 1 }),
      drops.length,
    )
    drops.forEach((m, i) => dropMesh.setMatrixAt(i, m))
    dropMesh.userData.noShadow = true
    grp.add(dropMesh)
  }
  return grp
}

/** liquid volume from the bottom up to `level` (open top unless `cap`) */
function liquidColumn(layers: string[], level: number, seed: number, cap = true, hard = false) {
  const lp = profile(wallProfile(LIQ_INSET, level).map((p) => [p.x, p.y] as [number, number]), seg(120, 24))
  const map = tex(liquidTexture(layers, lp, level, seed, hard))
  const g = new THREE.Group()
  g.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(lp, seg(200, 56)),
      phys({ map, roughness: 0.45, emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.04 }),
    ),
  )
  if (cap) g.add(liquidSurface(layers[layers.length - 1], level))
  return g
}

function liquidSurface(color: string, level: number) {
  const c = hex(color)
  const map = tex(
    paint(512, 512, (u, v) => {
      const rr = Math.hypot(u * 2 - 1, v * 2 - 1)
      const k = fbm(u * 8, v * 8, 4, 3)
      let col = mix(c, mix(c, [1, 1, 1], 0.2), clamp01(k + 0.2) * 0.4)
      col = mix(col, mix(c, [0, 0, 0], 0.25), smooth(0.8, 0.96, rr))
      return mix(col, [1, 1, 1], smooth(0.955, 0.99, rr) * 0.35)
    }),
  )
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radiusAt(level) - LIQ_INSET, seg(128, 48)),
    phys({ map, roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.1 }),
  )
  m.rotation.x = -Math.PI / 2
  m.position.y = level
  return m
}

function iceCubes() {
  return ([[-0.5, 0.3, 0.4], [0.05, 0.52, -0.3], [0.52, 0.26, 0.2]] as const).map(([x, z, rot]) => {
    const c = ice()
    c.scale.setScalar(0.34)
    c.position.set(x, TOP + 0.02, z)
    c.rotation.set(rot, rot * 2, rot)
    return c
  })
}

function strawMesh() {
  const curve = new THREE.LineCurve3(V(0.12, 0.35, -0.2), V(0.5, CUP.H + 0.88, -0.12))
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 1, 0.075, seg(40, 16), false),
    phys({
      color: '#f58fb3', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide,
      emissive: new THREE.Color('#ff5c9a'), emissiveIntensity: 0.06,
    }),
  )
}

function garnishes() {
  const k = kiwi()
  k.scale.setScalar(0.3)
  k.position.set(0.82, CUP.H + 0.14, 0.18)
  k.rotation.set(-0.15, -0.35, 0.1)
  const s = strawberry()
  s.scale.setScalar(0.23)
  s.position.set(-0.08, TOP + 0.66, 0.4)
  const mnt = mint()
  mnt.scale.setScalar(0.24)
  mnt.position.set(-0.5, TOP + 0.5, 0.36)
  mnt.rotation.z = 0.7
  return { kiwi: k, berry: s, mint: mnt }
}

export async function makkaCup(o: CupOpts) {
  const grp = new THREE.Group()
  grp.add(await cupShell(undefined, o.seed ?? 5))
  grp.add(liquidColumn(o.layers, TOP, o.seed ?? 5))
  if (o.ice !== false) grp.add(...iceCubes())
  if (o.cream !== false) grp.add(cream(TOP))
  if (o.straw !== false) grp.add(strawMesh())
  if (o.garnish !== false) {
    const g = garnishes()
    grp.add(g.kiwi, g.berry, g.mint)
  }
  return grp
}

/* ---------- jobs ---------- */
// fixed framing shared by every cup so they line up like the SVG version (rim ≈ 28 %, base ≈ 96 % of the height)
const CUP_SHOT = (width: number, height: number): Shot => ({
  width, height, pitch: 9, fov: 22, env: 1, key: 2.4,
  span: { top: V(0, CUP.H, 0), bottom: V(0, 0, CUP.Rb), at: [0.28, 0.955] },
})

export const HERO_LAYERS = ['#e8434f', '#f9a825', '#b9d86a']

export const CUPS: Array<{ name: string; build: () => Promise<THREE.Object3D> | THREE.Object3D; shot: Shot }> = SIGNATURES.map(
  (s, i) => ({
    name: `cup-sig-${i}`,
    build: () => makkaCup({ layers: s.layers, seed: 10 + i }),
    shot: CUP_SHOT(460, 644),
  }),
)

/**
 * The hero cup as stackable passes (same camera): the page pours the drink layer by layer, so every part is
 * its own cropped sprite + a rect (fractions of the frame) and the liquid levels, written to hero-cup.json.
 */
export async function heroPasses(capture: typeof import('./studio').capture, crop: typeof import('./studio').crop) {
  const shot = CUP_SHOT(720, 1008)
  const n = HERO_LAYERS.length
  const levels = HERO_LAYERS.map((_, k) => LIQ_INSET + ((TOP - LIQ_INSET) * (k + 1)) / n)
  const outs: Array<{ name: string; canvas: HTMLCanvasElement }> = []
  const rects: Record<string, [number, number, number, number]> = {}
  let project: ((p: THREE.Vector3) => [number, number]) | undefined
  let camera: ReturnType<typeof capture>['camera'] | undefined
  const pass = (name: string, parts: THREE.Object3D[], holdouts: THREE.Object3D[] = []) => {
    const g = new THREE.Group()
    g.add(...parts, ...holdouts)
    const hold = new Set<THREE.Object3D>()
    holdouts.forEach((h) => h.traverse((o) => hold.add(o)))
    const c = capture(g, { ...shot, holdout: (o) => hold.has(o) })
    project = c.project
    camera = c.camera
    const cr = crop(c.canvas)
    outs.push({ name: `hero-${name}`, canvas: cr.canvas })
    rects[name] = cr.rect
    console.log(`pass ${name}`)
  }
  pass('back', [await cupShell('back', 2)])
  HERO_LAYERS.forEach((col, k) => {
    pass(`col-${k}`, [liquidColumn([col], levels[k], 20 + k, false)])
    pass(`surf-${k}`, [liquidSurface(col, levels[k])])
  })
  const fullLiquid = () => liquidColumn(HERO_LAYERS, TOP, 2)
  iceCubes().forEach((c, i) => pass(`ice-${i}`, [c], [fullLiquid()]))
  pass('straw', [strawMesh()])
  pass('front', [await cupShell('front', 2)])
  pass('cream', [cream(TOP)], [fullLiquid()])
  const g = garnishes()
  pass('kiwi', [g.kiwi])
  pass('berry', [g.berry], [cream(TOP)])
  pass('mint', [g.mint], [cream(TOP)])

  const P = project!
  const r4 = (x: number) => Math.round(x * 10000) / 10000
  const meta = {
    frame: [shot.width, shot.height],
    rects,
    /** liquid levels (fraction of the frame height, centre of the surface ellipse), bottom → top */
    levels: levels.map((l) => r4(P(V(0, l, 0))[1])),
    bottom: r4(P(V(0, LIQ_INSET, 0))[1]),
    /** surface size at the bottom of the cup relative to each level (the cup is tapered) */
    surfaceScale: levels.map((l) => r4((radiusAt(LIQ_INSET) - LIQ_INSET) / (radiusAt(l) - LIQ_INSET))),
    rim: r4(P(V(0, CUP.H, 0))[1]),
    /** the render camera + light rig, so the live WebGL cup lines up with the sprites */
    camera,
    lights: { key: [-3.2, 5, 4.5, shot.key ?? 2.6], rim: [4, 3, -5, 1.5], fill: [5, -1.5, 3, 0.55], env: shot.env ?? 1, exposure: 1.05 },
  }
  return { outs, meta }
}

/** small glossy juice droplets for the pour splash, one per hero layer */
export const DROPS = HERO_LAYERS.map((col, k) => ({
  name: `hero-drop-${k}`,
  build: () => {
    const geo = new THREE.SphereGeometry(1, seg(64, 12), seg(48, 8))
    wobble(geo, 0.06, 1.5, k)
    return new THREE.Mesh(
      geo,
      phys({ color: new THREE.Color(col), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: new THREE.Color(col), emissiveIntensity: 0.15 }),
    )
  },
  shot: { width: 64, height: 64, pitch: 10, margin: 0.04 } as Shot,
}))

/** the finished hero cup as one model (same parts as the passes) — exported to GLB for the live spin */
export async function heroModel() {
  const n = HERO_LAYERS.length
  const levels = HERO_LAYERS.map((_, k) => LIQ_INSET + ((TOP - LIQ_INSET) * (k + 1)) / n)
  const g = new THREE.Group()
  g.add(await cupShell(undefined, 2))
  // one column with hard layer edges at the same levels as the sprites (separate columns would z-fight in 3D)
  g.add(liquidColumn(HERO_LAYERS, levels[n - 1], 20, false, true))
  g.add(liquidSurface(HERO_LAYERS[n - 1], levels[n - 1]))
  g.add(...iceCubes(), strawMesh(), cream(TOP))
  const gar = garnishes()
  g.add(gar.kiwi, gar.berry, gar.mint)
  return g
}
