/** Procedural fruit models — each returns a Group centred near the origin, about 2 units tall. */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { canvas, clamp01, css, fbm, hex, mix, noise3, paint, ramp, rng, smooth, spherePoint, tex, type RGB } from './tex'
import { leaf, phys, profile, profileAt, seg, stem, sweep, wobble } from './parts'

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const TAU = Math.PI * 2

/* ================= citrus slices ================= */
interface CitrusOpts {
  peel: string
  zest: string
  pith: string
  flesh: [string, string, string]
  segments: number
  pithW: number
  seeds: number
  thickness: number
  seed: number
}

function citrusFace(o: CitrusOpts) {
  const S = 1024, R = S / 2
  const r = rng(o.seed)
  const map = canvas(S), bump = canvas(S), rough = canvas(S)
  const m = map.getContext('2d')!, b = bump.getContext('2d')!, g = rough.getContext('2d')!
  const circle = (ctx: CanvasRenderingContext2D, rad: number, fill: string) => {
    ctx.beginPath()
    ctx.arc(R, R, rad, 0, TAU)
    ctx.fillStyle = fill
    ctx.fill()
  }
  const zestR = R * 0.985, pithR = R * 0.955, fleshR = R * (0.955 - o.pithW), core = R * 0.07
  // rind: zest ring → white pith
  circle(m, R, o.zest); circle(m, zestR, o.peel); circle(m, pithR, o.pith)
  circle(b, R, '#8a8a8a'); circle(b, pithR, '#9a9a9a')
  circle(g, R, '#7a7a7a'); circle(g, pithR, '#9a9a9a')
  // flesh bed
  const [f0, f1, f2] = o.flesh.map(hex) as [RGB, RGB, RGB]
  circle(m, fleshR, css(mix(f0, f1, 0.5)))
  circle(b, fleshR, '#5a5a5a')
  circle(g, fleshR, '#2e2e2e')

  // juice vesicles: radial teardrops, packed per segment
  const n = o.segments
  for (let i = 0; i < n; i++) {
    const ac = ((i + 0.5) / n) * TAU + r() * 0.05
    const half = (TAU / n) * 0.5
    const count = 520
    for (let k = 0; k < count; k++) {
      const rr = core + (fleshR - core) * Math.sqrt(0.02 + r() * 0.98)
      const a = ac + (r() * 2 - 1) * half * 0.9
      const x = R + rr * Math.cos(a), y = R + rr * Math.sin(a)
      const len = (10 + 26 * (rr / fleshR)) * (0.8 + r() * 0.5)
      const wid = 3.5 + r() * 3.5
      const t = r()
      const col = t < 0.5 ? mix(f0, f1, t * 2) : mix(f1, f2, (t - 0.5) * 2)
      for (const [ctx, fill] of [
        [m, css(col, 0.92)],
        [b, 'rgba(235,235,235,0.9)'],
      ] as const) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(a)
        ctx.scale(len, wid)
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
        if (ctx === m) {
          grd.addColorStop(0, css(mix(col, [1, 1, 1], 0.28), 0.95))
          grd.addColorStop(0.55, fill)
          grd.addColorStop(1, css(mix(col, [0.4, 0.15, 0], 0.18), 0.6))
        } else {
          grd.addColorStop(0, 'rgba(255,255,255,0.95)')
          grd.addColorStop(1, 'rgba(90,90,90,0.4)')
        }
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(0, 0, 1, 0, TAU)
        ctx.fill()
        ctx.restore()
      }
    }
  }
  // segment membranes (white, tapered) + core
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (r() - 0.5) * 0.04
    for (const [ctx, col, w] of [
      [m, o.pith, 1],
      [b, '#d0d0d0', 1],
      [g, '#8a8a8a', 1],
    ] as const) {
      ctx.beginPath()
      const nx = -Math.sin(a), ny = Math.cos(a)
      const w0 = 2.2 * w, w1 = 5.5 * w
      ctx.moveTo(R + core * Math.cos(a) + nx * w0, R + core * Math.sin(a) + ny * w0)
      ctx.lineTo(R + fleshR * Math.cos(a) + nx * w1, R + fleshR * Math.sin(a) + ny * w1)
      ctx.lineTo(R + fleshR * Math.cos(a) - nx * w1, R + fleshR * Math.sin(a) - ny * w1)
      ctx.lineTo(R + core * Math.cos(a) - nx * w0, R + core * Math.sin(a) - ny * w0)
      ctx.fillStyle = col
      ctx.fill()
    }
  }
  circle(m, core, o.pith); circle(b, core, '#c8c8c8'); circle(g, core, '#8a8a8a')
  // a few seeds near the core
  for (let i = 0; i < o.seeds; i++) {
    const a = (i / Math.max(1, o.seeds)) * TAU + r()
    const rr = core * 2.2 + r() * core * 1.5
    m.save()
    m.translate(R + rr * Math.cos(a), R + rr * Math.sin(a))
    m.rotate(a)
    m.fillStyle = '#f6eccb'
    m.beginPath()
    m.ellipse(0, 0, 18, 8, 0, 0, TAU)
    m.fill()
    m.restore()
  }
  // soft darkening where pith meets flesh (juice soaks it)
  const ring = m.createRadialGradient(R, R, fleshR * 0.96, R, R, fleshR * 1.05)
  ring.addColorStop(0, 'rgba(0,0,0,0)')
  ring.addColorStop(0.5, css(mix(f0, [1, 1, 1], 0.3), 0.35))
  ring.addColorStop(1, 'rgba(0,0,0,0)')
  m.fillStyle = ring
  m.fillRect(0, 0, S, S)
  return { map: tex(map), bump: tex(bump, false), rough: tex(rough, false) }
}

function citrusSlice(o: CitrusOpts) {
  const grp = new THREE.Group()
  const face = citrusFace(o)
  const faceMat = phys({
    map: face.map,
    bumpMap: face.bump,
    bumpScale: 2.2,
    roughnessMap: face.rough,
    roughness: 1,
    clearcoat: 0.85,
    clearcoatRoughness: 0.16,
    emissiveMap: face.map,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.13,
  })
  const front = new THREE.Mesh(new THREE.CircleGeometry(1, seg(180, 40)), faceMat)
  front.position.z = o.thickness / 2
  const back = front.clone()
  back.rotation.y = Math.PI
  back.position.z = -o.thickness / 2
  const peel = hex(o.peel), zest = hex(o.zest)
  const sideMap = paint(1024, 64, (u, v) => {
    const k = fbm(Math.cos(u * TAU) * 30, Math.sin(u * TAU) * 30, v * 3, 3)
    const pore = smooth(0.25, 0.45, noise3(Math.cos(u * TAU) * 160, Math.sin(u * TAU) * 160, v * 12))
    return mix(mix(peel, zest, 0.25 + k * 0.6), mix(peel, [0, 0, 0], 0.25), pore * 0.5)
  })
  const sideBump = paint(1024, 64, (u, v) => 0.6 - 0.4 * smooth(0.25, 0.45, noise3(Math.cos(u * TAU) * 160, Math.sin(u * TAU) * 160, v * 12)))
  const side = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, o.thickness, 180, 1, true),
    phys({ map: tex(sideMap), bumpMap: tex(sideBump, false), bumpScale: 1.5, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
  )
  side.rotation.x = Math.PI / 2
  grp.add(front, back, side)
  return grp
}

export function orange() {
  const g = citrusSlice({
    peel: '#f07a10', zest: '#e86a00', pith: '#fff1d8',
    flesh: ['#f77f00', '#ff9d1c', '#ffbd4a'],
    segments: 11, pithW: 0.045, seeds: 0, thickness: 0.2, seed: 11,
  })
  g.rotation.set(-0.42, 0.5, 0.2)
  return g
}

export function lemon() {
  const g = citrusSlice({
    peel: '#f5cc12', zest: '#e8b800', pith: '#fffbe6',
    flesh: ['#f2d32e', '#f8e36a', '#fff4a8'],
    segments: 9, pithW: 0.06, seeds: 2, thickness: 0.18, seed: 7,
  })
  g.rotation.set(-0.35, -0.55, -0.25)
  return g
}

/* ================= kiwi slice ================= */
export function kiwi() {
  const S = 1024, R = S / 2
  const r = rng(3)
  const fleshRamp = ramp([
    [0, '#f2efc6'], [0.13, '#e6ebb0'], [0.19, '#b3d84e'], [0.3, '#7cc22a'],
    [0.6, '#66b01f'], [0.9, '#57a019'], [0.955, '#4b9115'],
  ])
  const base = paint(S, S, (u, v) => {
    const x = u * 2 - 1, y = v * 2 - 1
    const rr = Math.hypot(x, y * 1.02)
    const a = Math.atan2(y, x)
    if (rr > 0.985) return hex('#4d3421')
    if (rr > 0.962) return mix(hex('#6d5a2c'), hex('#5c8a2a'), smooth(0.962, 0.985, rr) < 0.5 ? 1 : 0)
    const fib = noise3(Math.cos(a) * 70, Math.sin(a) * 70, rr * 4) * 0.5 + noise3(Math.cos(a) * 180, Math.sin(a) * 180, rr * 2) * 0.35
    let c = fleshRamp(rr + fib * 0.03)
    c = mix(c, [1, 1, 0.85], clamp01(fib) * 0.18 * smooth(0.2, 0.5, rr))
    c = mix(c, [0.1, 0.25, 0.02], clamp01(-fib) * 0.12)
    return c
  })
  const m = base.getContext('2d')!
  const bump = paint(S, S, (u, v) => {
    const x = u * 2 - 1, y = v * 2 - 1
    const a = Math.atan2(y, x)
    const rr = Math.hypot(x, y)
    return 0.5 + noise3(Math.cos(a) * 70, Math.sin(a) * 70, rr * 4) * 0.25 - (rr > 0.96 ? 0.15 : 0)
  })
  const b = bump.getContext('2d')!
  // pale rays out of the core
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU + r() * 0.05
    const r0 = R * 0.16, r1 = R * (0.55 + r() * 0.25)
    const w = 2 + r() * 3
    m.beginPath()
    m.moveTo(R + r0 * Math.cos(a) - Math.sin(a) * w, R + r0 * Math.sin(a) + Math.cos(a) * w)
    m.lineTo(R + r1 * Math.cos(a), R + r1 * Math.sin(a))
    m.lineTo(R + r0 * Math.cos(a) + Math.sin(a) * w, R + r0 * Math.sin(a) - Math.cos(a) * w)
    const grd = m.createLinearGradient(R + r0 * Math.cos(a), R + r0 * Math.sin(a), R + r1 * Math.cos(a), R + r1 * Math.sin(a))
    grd.addColorStop(0, 'rgba(240,245,200,0.4)')
    grd.addColorStop(1, 'rgba(250,250,215,0)')
    m.fillStyle = grd
    m.fill()
  }
  // the seed ring
  for (let i = 0; i < 150; i++) {
    const a = (i / 150) * TAU + (r() - 0.5) * 0.05
    const rr = R * (0.2 + r() * 0.15)
    const len = 15 + r() * 7, wid = 6.5 + r() * 2.5
    const x = R + rr * Math.cos(a), y = R + rr * Math.sin(a)
    for (const ctx of [m, b]) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(a + (r() - 0.5) * 0.4)
      ctx.beginPath()
      ctx.moveTo(-len, 0)
      ctx.quadraticCurveTo(0, -wid * 1.2, len * 0.9, 0)
      ctx.quadraticCurveTo(0, wid * 1.2, -len, 0)
      ctx.fillStyle = ctx === m ? '#140c05' : '#f0f0f0'
      ctx.fill()
      if (ctx === m) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.beginPath()
        ctx.ellipse(len * 0.2, -wid * 0.3, len * 0.3, wid * 0.25, 0, 0, TAU)
        ctx.fill()
      }
      ctx.restore()
    }
  }
  const map = tex(base)
  const faceMat = phys({
    map, bumpMap: tex(bump, false), bumpScale: 2, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.18,
    emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.12,
  })
  const t = 0.2
  const grp = new THREE.Group()
  const front = new THREE.Mesh(new THREE.CircleGeometry(1, seg(180, 40)), faceMat)
  front.position.z = t / 2
  const back = front.clone()
  back.rotation.y = Math.PI
  back.position.z = -t / 2
  const skinMap = paint(1024, 64, (u, v) => mix(hex('#5a3b22'), hex('#8a6a42'), clamp01(0.5 + fbm(Math.cos(u * TAU) * 40, Math.sin(u * TAU) * 40, v * 4, 4))))
  const side = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, t, seg(180, 40), 1, true),
    phys({ map: tex(skinMap), roughness: 0.95, sheen: 1, sheenColor: new THREE.Color('#c9a26b'), sheenRoughness: 0.7 }),
  )
  side.rotation.x = Math.PI / 2
  grp.add(front, back, side)
  grp.rotation.set(-0.4, -0.45, 0.3)
  return grp
}

/* ================= strawberry ================= */
export function strawberry() {
  const pts = profile([
    [0, -1.06], [0.11, -0.98], [0.27, -0.82], [0.44, -0.58], [0.59, -0.3], [0.7, -0.02],
    [0.76, 0.22], [0.76, 0.42], [0.69, 0.58], [0.53, 0.7], [0.3, 0.77], [0.1, 0.8], [0, 0.8],
  ], seg(110, 32))
  const geo = new THREE.LatheGeometry(pts, seg(180, 40))
  wobble(geo, 0.05, 1.3, 4)

  // seeds: poisson-ish scatter over the surface (skip the top, the calyx sits there)
  const r = rng(21)
  const seeds: Array<{ u: number; v: number; p: THREE.Vector3; n: THREE.Vector3; t: THREE.Vector3 }> = []
  let tries = 0
  while (seeds.length < 230 && tries++ < 20000) {
    const v = 0.04 + r() * 0.8
    const pr = profileAt(pts, v)
    if (r() > pr.r / 0.76) continue
    const u = r()
    const phi = u * TAU
    const p = V(pr.r * Math.sin(phi), pr.y, pr.r * Math.cos(phi))
    if (seeds.some((s) => s.p.distanceToSquared(p) < 0.105 * 0.105)) continue
    const len = Math.hypot(pr.dr, pr.dy)
    const n2 = new THREE.Vector2(pr.dy / len, -pr.dr / len)
    const n = V(n2.x * Math.sin(phi), n2.y, n2.x * Math.cos(phi)).normalize()
    const t = V((pr.dr / len) * Math.sin(phi), pr.dy / len, (pr.dr / len) * Math.cos(phi)).normalize()
    seeds.push({ u, v, p, n, t })
  }
  const W = 1024, H = 1024
  const L = pts.reduce((s, p, i) => (i ? s + p.distanceTo(pts[i - 1]) : 0), 0)
  const body = ramp([[0, '#e8492f'], [0.22, '#d61c2b'], [0.55, '#c30f27'], [0.78, '#cf2330'], [0.9, '#e8665a'], [1, '#f6c0a8']])
  const colorC = paint(W, H, (u, v) => {
    const a = u * TAU
    const k = fbm(Math.cos(a) * 3, Math.sin(a) * 3, v * 5, 4)
    return mix(body(v + k * 0.05), [0.45, 0.02, 0.05], clamp01(-k) * 0.35)
  })
  const bumpC = paint(W, H, (u, v) => 0.62 + fbm(Math.cos(u * TAU) * 6, Math.sin(u * TAU) * 6, v * 10, 3) * 0.12)
  const cm = colorC.getContext('2d')!, bm = bumpC.getContext('2d')!
  for (const s of seeds) {
    const pr = profileAt(pts, s.v)
    const ru = (0.055 / (TAU * Math.max(pr.r, 0.1))) * W
    const rv = (0.07 / L) * H
    for (const x of [s.u * W, s.u * W - W, s.u * W + W]) {
      const y = (1 - s.v) * H
      bm.save(); bm.translate(x, y); bm.scale(ru, rv)
      const g = bm.createRadialGradient(0, 0, 0, 0, 0, 1)
      g.addColorStop(0, 'rgba(40,40,40,1)'); g.addColorStop(0.6, 'rgba(90,90,90,0.8)'); g.addColorStop(1, 'rgba(160,160,160,0)')
      bm.fillStyle = g; bm.beginPath(); bm.arc(0, 0, 1, 0, TAU); bm.fill(); bm.restore()
      cm.save(); cm.translate(x, y); cm.scale(ru * 0.9, rv * 0.9)
      const h = cm.createRadialGradient(0, 0, 0, 0, 0, 1)
      h.addColorStop(0, 'rgba(120,0,20,0.45)'); h.addColorStop(1, 'rgba(120,0,20,0)')
      cm.fillStyle = h; cm.beginPath(); cm.arc(0, 0, 1, 0, TAU); cm.fill(); cm.restore()
    }
  }
  const map = tex(colorC)
  const berry = new THREE.Mesh(
    geo,
    phys({
      map, bumpMap: tex(bumpC, false), bumpScale: 3.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2,
      emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.08,
    }),
  )
  const seedGeo = new THREE.SphereGeometry(1, seg(12, 5), seg(8, 3))
  const seedMesh = new THREE.InstancedMesh(
    seedGeo,
    phys({ color: new THREE.Color('#f0cf6a'), roughness: 0.35, clearcoat: 0.6, emissive: new THREE.Color('#5a3a00'), emissiveIntensity: 0.15 }),
    seeds.length,
  )
  const mtx = new THREE.Matrix4()
  seeds.forEach((s, i) => {
    const y = s.t.clone().negate()
    const z = s.n
    const x = new THREE.Vector3().crossVectors(y, z).normalize()
    const basis = new THREE.Matrix4().makeBasis(x, y, V(0, 0, 0).crossVectors(x, y))
    const sc = 0.8 + r() * 0.4
    mtx.copy(basis).scale(V(0.02 * sc, 0.034 * sc, 0.016 * sc)).setPosition(s.p.clone().addScaledVector(s.n, -0.006))
    seedMesh.setMatrixAt(i, mtx)
  })
  const grp = new THREE.Group()
  grp.add(berry, seedMesh)
  // calyx: sepals draped over the shoulder
  const sepals = 10
  for (let i = 0; i < sepals; i++) {
    const s = leaf({
      length: 0.6 + r() * 0.14, width: 0.22 + r() * 0.05,
      shape: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.55)), 1.1),
      fold: 0.35, arch: -0.12, colors: ['#1f5f1c', '#347f28', '#7fb356'], veins: 3, seed: i + 1, gloss: 0.3,
    })
    s.rotation.order = 'YXZ'
    s.rotation.y = (i / sepals) * TAU + r() * 0.2
    s.rotation.x = Math.PI / 2 - 0.08 - r() * 0.12
    s.position.set(0, 0.83, 0)
    grp.add(s)
  }
  grp.add(stem([[0, 0.76, 0], [0.02, 0.92, 0.01], [0.07, 1.08, 0.03]], 0.04, 0.03, '#5d8a2e'))
  grp.rotation.set(0.35, 0.2, -0.38)
  return grp
}

/* ================= mango ================= */
function mangoShape(p: THREE.Vector3) {
  const { x, y, z } = p
  let X = x * 1.38, Y = y * 0.95, Z = z * 0.82
  const f = 1 - 0.12 * x
  Y *= f; Z *= f
  if (y < 0) Y *= 0.9
  Y -= 0.2 * x * x - 0.05 * x
  const beak = smooth(0.55, 1, x) * smooth(0.1, -0.7, y)
  X += 0.07 * beak
  Y -= 0.04 * beak
  const k = fbm(x * 1.4 + 3, y * 1.4, z * 1.4, 3) * 0.03
  return V(X * (1 + k), Y * (1 + k), Z * (1 + k))
}

export function mango() {
  const geo = new THREE.SphereGeometry(1, 200, 140)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const q = mangoShape(V(pos.getX(i), pos.getY(i), pos.getZ(i)))
    pos.setXYZ(i, q.x, q.y, q.z)
  }
  geo.computeVertexNormals()
  const colour = (u: number, v: number): RGB => {
    const p = spherePoint(u, v)
    const k = fbm(p.x * 2.2, p.y * 2.2, p.z * 2.2, 4)
    const blush = smooth(-0.1, 0.75, p.y * 0.85 - p.x * 0.55 + k * 0.7)
    const green = smooth(0.25, 0.95, p.x * 0.6 - p.y * 0.55 + k * 0.4)
    let c = mix(hex('#ffb31f'), hex('#ffd33d'), clamp01(0.5 + k))
    c = mix(c, hex('#b8c236'), green * 0.85)
    c = mix(c, mix(hex('#e4572e'), hex('#c62b2b'), blush), blush * 0.9)
    const dot = smooth(0.38, 0.5, noise3(p.x * 55, p.y * 55, p.z * 55))
    return mix(c, hex('#fff1a6'), dot * 0.55)
  }
  const mapC = paint(2048, 1024, colour)
  const bumpC = paint(1024, 512, (u, v) => {
    const p = spherePoint(u, v)
    return 0.55 + fbm(p.x * 8, p.y * 8, p.z * 8, 3) * 0.15 + smooth(0.38, 0.5, noise3(p.x * 55, p.y * 55, p.z * 55)) * 0.2
  })
  const map = tex(mapC)
  const fruit = new THREE.Mesh(
    geo,
    phys({
      map, bumpMap: tex(bumpC, false), bumpScale: 1.2, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.35,
      emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.06,
    }),
  )
  const grp = new THREE.Group()
  grp.add(fruit)
  const top = mangoShape(V(-0.9, 0.42, 0).normalize())
  grp.add(stem([[top.x + 0.02, top.y - 0.06, top.z], [top.x - 0.05, top.y + 0.08, 0], [top.x - 0.12, top.y + 0.2, 0.02]], 0.05, 0.04, '#5f5a26'))
  const lf = leaf({
    length: 1.35, width: 0.34, shape: (s) => Math.pow(Math.sin(Math.PI * Math.pow(s, 0.7)), 0.9),
    fold: 0.18, arch: 0.18, twist: 0.4, colors: ['#1f5e22', '#2e7d32', '#8bc34a'], veins: 14, seed: 5, gloss: 0.6,
  })
  lf.position.set(top.x - 0.11, top.y + 0.18, 0.02)
  lf.rotation.set(0.3, 0.35, 0.95)
  grp.add(lf)
  grp.rotation.set(-0.25, 0.3, -0.42)
  return grp
}

/* ================= peach ================= */
export function peach() {
  const geo = new THREE.SphereGeometry(1, 180, 140)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const crease = 0.075 * Math.exp(-((x / 0.11) ** 2)) * smooth(-0.35, 0.55, z) * (0.55 + 0.45 * y)
    const dimple = 0.12 * Math.exp(-(x * x + z * z) / 0.05) * smooth(0.6, 1, y)
    const k = 1 - crease + fbm(x * 1.6, y * 1.6, z * 1.6, 3) * 0.025
    pos.setXYZ(i, x * k * 1.02, y * k * 0.95 - dimple, z * k)
  }
  geo.computeVertexNormals()
  const mapC = paint(2048, 1024, (u, v) => {
    const p = spherePoint(u, v)
    const k = fbm(p.x * 2.4, p.y * 2.4, p.z * 2.4, 4)
    const blush = smooth(-0.35, 0.55, 0.55 * p.z + 0.35 * p.y + k * 0.8)
    let c = mix(hex('#ffc56e'), hex('#ffb04a'), clamp01(0.5 + k))
    c = mix(c, mix(hex('#e8563a'), hex('#b8282a'), smooth(0.4, 1, blush)), blush * 0.92)
    const speck = smooth(0.3, 0.46, noise3(p.x * 42, p.y * 42, p.z * 42)) * blush
    return mix(c, hex('#8e1b1f'), speck * 0.5)
  })
  const map = tex(mapC)
  const fruit = new THREE.Mesh(
    geo,
    phys({
      map, roughness: 0.72, sheen: 1, sheenColor: new THREE.Color('#ffd8c4'), sheenRoughness: 0.45,
      emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.05,
    }),
  )
  const grp = new THREE.Group()
  grp.add(fruit)
  grp.add(stem([[0, 0.8, 0], [0.02, 0.92, 0], [0.05, 1.0, 0.02]], 0.045, 0.035, '#6b5a32'))
  const lf = leaf({ length: 1.05, width: 0.34, fold: 0.2, arch: 0.2, twist: -0.3, colors: ['#2b6e2a', '#3f8f37', '#9ccc65'], veins: 12, seed: 9, gloss: 0.5 })
  lf.position.set(0.05, 0.95, 0.02)
  lf.rotation.set(0.35, -0.2, -0.95)
  grp.add(lf)
  grp.rotation.set(0.15, -0.3, 0.12)
  return grp
}

/* ================= avocado half ================= */
export function avocado() {
  const out: Array<[number, number]> = [
    [0, -1.0], [0.36, -0.95], [0.6, -0.78], [0.74, -0.52], [0.78, -0.22], [0.72, 0.08],
    [0.6, 0.36], [0.47, 0.6], [0.36, 0.8], [0.22, 0.95], [0, 1.02],
  ]
  const pts = profile(out, 100)
  const skin = new THREE.LatheGeometry(pts, 120, Math.PI / 2, Math.PI)
  wobble(skin, 0.02, 2, 2)
  const skinMap = paint(1024, 1024, (u, v) => {
    const a = u * Math.PI
    const k = fbm(Math.cos(a) * 20, v * 30, Math.sin(a) * 20, 4)
    return mix(hex('#24381a'), hex('#3f5f24'), clamp01(0.5 + k))
  })
  const skinBump = paint(1024, 1024, (u, v) => 0.5 + noise3(u * 90, v * 90, 1) * 0.35 + noise3(u * 30, v * 30, 2) * 0.2)
  const skinMesh = new THREE.Mesh(
    skin,
    phys({ map: tex(skinMap), bumpMap: tex(skinBump, false), bumpScale: 3, roughness: 0.62, clearcoat: 0.3, clearcoatRoughness: 0.5, side: THREE.DoubleSide }),
  )
  // cut face
  const shape = new THREE.Shape()
  const outline = [...pts.map((p) => new THREE.Vector2(p.x, p.y)), ...pts.slice().reverse().map((p) => new THREE.Vector2(-p.x, p.y))]
  shape.setFromPoints(outline)
  const face = new THREE.ShapeGeometry(shape, 80)
  const fp = face.getAttribute('position'), fuv = face.getAttribute('uv')
  for (let i = 0; i < fp.count; i++) fuv.setXY(i, (fp.getX(i) + 0.8) / 1.6, (fp.getY(i) + 1.05) / 2.1)
  const pit = { x: 0, y: -0.28, r: 0.37 }
  const poly = outline
  const flesh = ramp([[0, '#1f2e10'], [0.012, '#2c4214'], [0.03, '#5c8f26'], [0.07, '#8fc242'], [0.15, '#c8dc62'], [0.3, '#e6ec96'], [0.5, '#f1f1b0']])
  const faceMap = paint(768, 1008, (u, v) => {
    const x = u * 1.6 - 0.8, y = v * 2.1 - 1.05
    let d = Infinity
    for (let i = 0; i < poly.length; i += 2) d = Math.min(d, Math.hypot(poly[i].x - x, poly[i].y - y))
    const k = fbm(x * 8, y * 8, 1, 3)
    let c = flesh(d + k * 0.02)
    const pd = Math.hypot(x - pit.x, (y - pit.y) / 1.1) - pit.r
    c = mix(c, hex('#d9d67a'), (1 - smooth(0, 0.07, Math.abs(pd))) * 0.45)
    return mix(c, [1, 1, 0.9], clamp01(k) * 0.12)
  })
  const fmap = tex(faceMap)
  const faceMesh = new THREE.Mesh(
    face,
    phys({
      map: fmap, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.3,
      bumpMap: tex(paint(512, 512, (u, v) => 0.5 + fbm(u * 40, v * 40, 3, 3) * 0.2), false), bumpScale: 1,
      emissiveMap: fmap, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.1,
    }),
  )
  faceMesh.position.z = 0.001
  const pitGeo = new THREE.SphereGeometry(pit.r, 128, 96)
  pitGeo.scale(1, 1.1, 1)
  const pitMap = paint(1024, 512, (u, v) => {
    const p = spherePoint(u, v)
    const k = fbm(p.x * 3, p.y * 6, p.z * 3, 5)
    return mix(mix(hex('#6b3d1d'), hex('#a8703c'), clamp01(0.5 + k)), hex('#4a2812'), smooth(0.1, 0.4, noise3(p.x * 4, p.y * 14, p.z * 4)) * 0.5)
  })
  const pitMesh = new THREE.Mesh(pitGeo, phys({ map: tex(pitMap), roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.15 }))
  pitMesh.position.set(pit.x, pit.y, 0.02)
  const grp = new THREE.Group()
  grp.add(skinMesh, faceMesh, pitMesh)
  grp.rotation.set(-0.1, 0.4, 0.4)
  return grp
}

/* ================= banana ================= */
export function banana() {
  const curve = new THREE.CatmullRomCurve3([
    V(-1.5, 0.72, 0), V(-1.22, 0.36, 0.02), V(-0.7, -0.1, 0.05), V(0, -0.3, 0.07), V(0.7, -0.12, 0.05), V(1.18, 0.3, 0.01), V(1.34, 0.52, -0.01),
  ])
  const rad = (t: number, a: number) => {
    let r: number
    if (t < 0.004) r = 0.001
    else if (t < 0.09) r = 0.085
    else if (t < 0.24) r = 0.085 + 0.25 * smooth(0.09, 0.24, t)
    else if (t < 0.84) r = 0.335 - 0.04 * Math.abs(t - 0.52) * 2
    else r = 0.264 * Math.sqrt(Math.max(0, 1 - ((t - 0.84) / 0.16) ** 2)) + 0.045
    if (t > 0.996) r = 0.001
    const lobes = 1 + 0.07 * Math.cos(5 * a)
    return r * lobes * (1 - 0.06 * Math.sin(a) ** 2)
  }
  const geo = sweep(curve, rad, { segs: 260, around: 60 })
  const mapC = paint(512, 1024, (u, v) => {
    const k = fbm(u * 6, v * 20, 1, 3)
    let c = mix(hex('#f6c928'), hex('#fbe16a'), clamp01(0.5 + k))
    c = mix(c, hex('#a9b43a'), smooth(0.26, 0.1, v) * 0.85)
    c = mix(c, hex('#7c7634'), smooth(0.1, 0.06, v))
    c = mix(c, hex('#3a2a18'), smooth(0.012, 0.004, v))
    c = mix(c, hex('#3a2a18'), smooth(0.975, 0.99, v))
    c = mix(c, hex('#b8a23a'), Math.pow(Math.abs(Math.cos(2.5 * u * TAU)), 10) * 0.35)
    const spot = smooth(0.5, 0.62, noise3(u * 30, v * 70, 5)) * smooth(0.2, 0.3, v) * smooth(0.95, 0.85, v)
    c = mix(c, hex('#6e4a1f'), spot * 0.7)
    return mix(c, hex('#d9a520'), clamp01(noise3(u * 80, v * 5, 2)) * 0.25)
  })
  const bumpC = paint(512, 1024, (u, v) => 0.5 + Math.pow(Math.abs(Math.cos(2.5 * u * TAU)), 10) * 0.2 + noise3(u * 80, v * 6, 2) * 0.12)
  const mesh = new THREE.Mesh(geo, phys({ map: tex(mapC), bumpMap: tex(bumpC, false), bumpScale: 1.5, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 }))
  const grp = new THREE.Group()
  grp.add(mesh)
  grp.rotation.set(0.5, -0.3, 0.3)
  return grp
}

/* ================= berries (blueberries + raspberries) ================= */
function blueberry(seed: number) {
  const geo = new THREE.SphereGeometry(1, 96, 72)
  const pos = geo.getAttribute('position')
  const col: number[] = []
  const navy = hex('#2b3a6b'), plum = hex('#3b2f5e'), crown = hex('#221a2a')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const rho = Math.hypot(x, z)
    const th = Math.atan2(z, x)
    let Y = y * 0.86
    if (y > 0) {
      Y -= 0.16 * Math.exp(-((rho / 0.2) ** 2))
      Y += 0.05 * Math.pow(Math.max(0, Math.cos(5 * th + seed)), 1.5) * Math.exp(-(((rho - 0.2) / 0.06) ** 2))
    }
    const k = fbm(x * 2 + seed, y * 2, z * 2, 3) * 0.02
    pos.setXYZ(i, x * (1 + k), Y * (1 + k), z * (1 + k))
    let c = mix(navy, plum, clamp01(0.5 + fbm(x * 3 + seed, y * 3, z * 3, 3)))
    c = mix(c, crown, y > 0 ? 1 - smooth(0.17, 0.3, rho) : 0)
    col.push(...c.map((q) => Math.pow(q, 2.2)))
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  geo.computeVertexNormals()
  return new THREE.Mesh(
    geo,
    phys({ vertexColors: true, roughness: 0.55, sheen: 1, sheenColor: new THREE.Color('#b9c8f2'), sheenRoughness: 0.32, clearcoat: 0.1 }),
  )
}

function raspberry(seed: number) {
  const r = rng(seed)
  const pts: THREE.Vector3[] = []
  const N = 84
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 1.75
    const rr = Math.sqrt(Math.max(0, 1 - y * y))
    const a = i * 2.39996
    pts.push(V(Math.cos(a) * rr, y, Math.sin(a) * rr))
  }
  const drupe = new THREE.SphereGeometry(1, 28, 20)
  const mesh = new THREE.InstancedMesh(
    drupe,
    phys({ color: '#ffffff', roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, emissive: new THREE.Color('#5e0016'), emissiveIntensity: 0.3, sheen: 0.4, sheenColor: new THREE.Color('#ff9fb4') }),
    pts.length,
  )
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  pts.forEach((p, i) => {
    const s = V(p.x * 0.6, p.y * 0.78, p.z * 0.6)
    const n = p.clone().normalize()
    q.setFromUnitVectors(V(0, 0, 1), n)
    const k = 0.135 + r() * 0.02
    m.compose(s.addScaledVector(n, 0.02), q, V(k, k, k * 0.85))
    mesh.setMatrixAt(i, m)
    mesh.setColorAt(i, new THREE.Color().setRGB(...(mix(hex('#c40d38'), hex('#e8305a'), r()).map((c) => Math.pow(c, 2.2)) as RGB)))
  })
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), phys({ color: '#7a0a22', roughness: 0.5 }))
  core.scale.set(0.95, 1.2, 0.95)
  core.userData.noFit = true
  const g = new THREE.Group()
  g.add(mesh, core)
  return g
}

export function berries() {
  const grp = new THREE.Group()
  const spots: Array<[number, number, number, number, number]> = [
    [-0.42, -0.2, 0.25, 0.52, 1], [0.35, -0.28, 0.3, 0.48, 2], [-0.02, 0.18, 0.05, 0.5, 3], [0.62, 0.22, -0.2, 0.44, 4],
  ]
  for (const [x, y, z, s, sd] of spots) {
    const b = blueberry(sd)
    b.scale.setScalar(s)
    b.position.set(x, y, z)
    b.rotation.set(0.5 + sd * 0.2, sd, 0.2 * sd)
    grp.add(b)
  }
  const r1 = raspberry(3)
  r1.scale.setScalar(0.62)
  r1.position.set(-0.78, 0.34, -0.15)
  r1.rotation.set(0.3, 0.2, 0.9)
  const r2 = raspberry(8)
  r2.scale.setScalar(0.58)
  r2.position.set(0.1, -0.62, 0.45)
  r2.rotation.set(0.5, 0.4, -1.9)
  grp.add(r1, r2)
  grp.rotation.set(0.2, 0, 0.1)
  return grp
}

/* ================= mint sprig ================= */
export function mint() {
  const grp = new THREE.Group()
  grp.add(stem([[0.02, -0.85, 0], [0.04, -0.3, 0.02], [-0.02, 0.35, 0.04], [0.02, 0.9, 0]], 0.04, 0.025, '#4e7a30'))
  const opts = { colors: ['#1f6a26', '#339437', '#6fbf66'] as [string, string, string], teeth: 16, veins: 8, rugose: 1, fold: 0.36, gloss: 0.15 }
  const pairs: Array<[number, number, number, number, number]> = [
    // y, length, width, tilt from vertical, yaw
    [-0.4, 1.02, 0.72, 1.2, 0.2],
    [0.08, 0.88, 0.62, 0.95, 1.5],
    [0.5, 0.66, 0.46, 0.62, 0.35],
    [0.8, 0.44, 0.3, 0.35, 1.6],
  ]
  pairs.forEach(([y, length, width, tilt, yaw], k) => {
    for (const side of [1, -1]) {
      const l = leaf({ ...opts, length, width, arch: 0.18, twist: side * 0.2, seed: k * 2 + side + 5 })
      l.rotation.order = 'YZX'
      l.rotation.y = yaw + (side < 0 ? Math.PI : 0)
      l.rotation.z = -tilt
      l.rotation.x = -0.25
      l.position.set(0, y, 0)
      grp.add(l)
    }
  })
  const bud = leaf({ ...opts, length: 0.3, width: 0.2, arch: -0.1, seed: 99 })
  bud.position.set(0.02, 0.92, 0)
  grp.add(bud)
  grp.rotation.set(0.1, 0.2, -0.35)
  return grp
}

/* ================= watermelon wedge ================= */
export function watermelon() {
  const R = 1.9, half = THREE.MathUtils.degToRad(24), d = 0.44
  const tip = V(0, 0.95, 0)
  const a0 = -Math.PI / 2 - half, a1 = -Math.PI / 2 + half
  const r = rng(12)
  const seeds = Array.from({ length: 13 }, (_, i) => ({ u: 0.5 + r() * 0.2, v: 0.1 + (i / 12) * 0.8 + (r() - 0.5) * 0.03 }))
  const colour = (u: number, v: number, withSeeds: boolean): RGB => {
    const k = fbm(u * 12, v * 12, 3, 3)
    if (u > 0.975) return mix(hex('#1f5a1e'), hex('#2f7a25'), clamp01(0.5 + k))
    if (u > 0.93) return mix(hex('#7fb24e'), hex('#d4ebb0'), smooth(0.975, 0.935, u))
    if (u > 0.885) return mix(hex('#eaf4d2'), hex('#f5b5b0'), smooth(0.93, 0.885, u))
    let c = mix(hex('#f0414f'), hex('#f56a6c'), smooth(0.6, 0.88, u))
    c = mix(c, hex('#d8243b'), clamp01(-k) * 0.5)
    const grain = smooth(0.25, 0.55, noise3(u * 120, v * 120 * (u + 0.1), 7))
    c = mix(c, hex('#ffb3b3'), grain * 0.35)
    if (withSeeds)
      for (const s of seeds) {
        const du = (u - s.u) * R
        const dv = (v - s.v) * (2 * half) * R * s.u
        const e = (du / 0.075) ** 2 + (dv / (0.034 * (1 + du * 4))) ** 2
        if (e < 1) return mix(hex('#140d0a'), hex('#3a2a20'), clamp01(1 - e) * 0.3)
        if (e < 1.8) c = mix(c, hex('#ffe0e0'), (1.8 - e) * 0.3)
      }
    return c
  }
  const faceMap = tex(paint(1024, 1024, (u, v) => colour(u, v, true)))
  const faceBump = tex(paint(1024, 1024, (u, v) => 0.5 + smooth(0.25, 0.55, noise3(u * 120, v * 120 * (u + 0.1), 7)) * 0.3), false)
  const fleshMat = phys({
    map: faceMap, bumpMap: faceBump, bumpScale: 2, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2,
    emissiveMap: faceMap, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.1,
  })
  const face = (z: number, flip: boolean) => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = []
    const KR = 60, KA = 80
    for (let i = 0; i <= KR; i++)
      for (let j = 0; j <= KA; j++) {
        const rr = (i / KR) * R, a = a0 + (j / KA) * (a1 - a0)
        pos.push(tip.x + rr * Math.cos(a), tip.y + rr * Math.sin(a), z)
        uv.push(i / KR, j / KA)
      }
    for (let i = 0; i < KR; i++)
      for (let j = 0; j < KA; j++) {
        const a = i * (KA + 1) + j, b = a + 1, c = a + KA + 1, e = c + 1
        if (flip) idx.push(a, c, b, b, c, e)
        else idx.push(a, b, c, b, e, c)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return new THREE.Mesh(g, fleshMat)
  }
  // straight cut sides + rind band
  const strip = (fn: (s: number, t: number) => THREE.Vector3, mat: THREE.Material, S = 60, T = 8) => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = []
    for (let i = 0; i <= S; i++)
      for (let j = 0; j <= T; j++) {
        const p = fn(i / S, j / T)
        pos.push(p.x, p.y, p.z)
        uv.push(i / S, j / T)
      }
    for (let i = 0; i < S; i++)
      for (let j = 0; j < T; j++) {
        const a = i * (T + 1) + j, b = a + 1, c = a + T + 1, e = c + 1
        idx.push(a, b, c, b, e, c)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return new THREE.Mesh(g, mat)
  }
  const sideMap = tex(paint(1024, 64, (u) => colour(u, 0.5, false)))
  const sideMat = phys({ map: sideMap, roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide, emissiveMap: sideMap, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.1 })
  const rindMap = tex(paint(1024, 256, (u, v) => {
    const w = Math.sin(u * 60 + noise3(u * 8, v * 3, 1) * 3)
    const k = fbm(u * 30, v * 8, 2, 4)
    return mix(hex('#1d4f1d'), hex('#4f8f36'), clamp01(0.5 + w * 0.45 + k * 0.4))
  }))
  const rindMat = phys({ map: rindMap, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.25, side: THREE.DoubleSide })
  const grp = new THREE.Group()
  grp.add(face(d / 2, false), face(-d / 2, true))
  for (const a of [a0, a1])
    grp.add(strip((s, t) => V(tip.x + s * R * Math.cos(a), tip.y + s * R * Math.sin(a), -d / 2 + t * d), sideMat))
  grp.add(strip((s, t) => {
    const a = a0 + s * (a1 - a0)
    return V(tip.x + R * Math.cos(a), tip.y + R * Math.sin(a), -d / 2 + t * d)
  }, rindMat, 80, 10))
  grp.rotation.set(-0.3, 0.45, 0.28)
  return grp
}

/* ================= pomegranate half ================= */
export function pomegranate() {
  const r = rng(31)
  const skinGeo = new THREE.SphereGeometry(1, 140, 100, Math.PI, Math.PI)
  wobble(skinGeo, 0.04, 1.4, 6)
  const skinMap = paint(2048, 1024, (u, v) => {
    const p = spherePoint(u, v)
    const k = fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5, 5)
    let c = mix(hex('#a3171f'), hex('#d23a34'), clamp01(0.5 + k))
    c = mix(c, hex('#e89a6e'), smooth(0.15, 0.4, fbm(p.x * 1.6 + 4, p.y * 1.6, p.z * 1.6, 3)) * 0.55)
    return mix(c, hex('#5e0b12'), smooth(0.35, 0.5, noise3(p.x * 30, p.y * 30, p.z * 30)) * 0.4)
  })
  const skin = new THREE.Mesh(skinGeo, phys({ map: tex(skinMap), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, side: THREE.DoubleSide }))
  const membranes = Array.from({ length: 6 }, (_, i) => (i / 6) * TAU + r() * 0.3)
  const nearMembrane = (x: number, y: number) => {
    const rr = Math.hypot(x, y)
    const a = Math.atan2(y, x)
    let dmin = Infinity
    for (const m of membranes) {
      let da = Math.abs(((a - m + Math.PI) % TAU + TAU) % TAU - Math.PI)
      dmin = Math.min(dmin, da * rr)
    }
    return dmin
  }
  const faceMap = paint(1024, 1024, (u, v) => {
    const x = u * 2 - 1, y = v * 2 - 1
    const rr = Math.hypot(x, y)
    if (rr > 0.975) return hex('#9e1a22')
    if (rr > 0.9) return mix(hex('#f2dca8'), hex('#e9c48f'), smooth(0.9, 0.975, rr))
    const mem = nearMembrane(x, y)
    if (mem < 0.03 || rr < 0.1) return mix(hex('#f4e0b0'), hex('#ead0a0'), clamp01(0.5 + noise3(x * 20, y * 20, 1)))
    return mix(hex('#5c0b16'), hex('#8a1422'), clamp01(0.5 + noise3(x * 30, y * 30, 2)))
  })
  const face = new THREE.Mesh(new THREE.CircleGeometry(1, 160), phys({ map: tex(faceMap), roughness: 0.55, clearcoat: 0.3 }))
  face.position.z = 0.001
  // arils
  const arils: Array<[number, number]> = []
  let tries = 0
  while (arils.length < 260 && tries++ < 30000) {
    const x = (r() * 2 - 1) * 0.88, y = (r() * 2 - 1) * 0.88
    const rr = Math.hypot(x, y)
    if (rr > 0.87 || rr < 0.13 || nearMembrane(x, y) < 0.05) continue
    if (arils.some(([ax, ay]) => (ax - x) ** 2 + (ay - y) ** 2 < 0.1 * 0.1)) continue
    arils.push([x, y])
  }
  const arilGeo = new THREE.IcosahedronGeometry(1, 3)
  const inst = new THREE.InstancedMesh(
    arilGeo,
    phys({ color: '#ffffff', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, emissive: new THREE.Color('#6a0716'), emissiveIntensity: 0.45, specularIntensity: 1 }),
    arils.length,
  )
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler()
  arils.forEach(([x, y], i) => {
    e.set((r() - 0.5) * 0.6, (r() - 0.5) * 0.6, Math.atan2(y, x) + Math.PI / 2)
    q.setFromEuler(e)
    m.compose(V(x, y, 0.045 + r() * 0.02), q, V(0.052 + r() * 0.01, 0.068 + r() * 0.01, 0.05))
    inst.setMatrixAt(i, m)
    inst.setColorAt(i, new THREE.Color().setRGB(...(mix(hex('#9c0c26'), hex('#e0283f'), r()).map((c) => Math.pow(c, 2.2)) as RGB)))
  })
  const grp = new THREE.Group()
  grp.add(skin, face, inst)
  // crown
  const crownMat = phys({ color: '#b8342e', roughness: 0.5, clearcoat: 0.3 })
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.13, 0.24, 48, 1, true), crownMat)
  tube.position.set(0, 1.04, -0.14)
  tube.material.side = THREE.DoubleSide
  grp.add(tube)
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 16), crownMat)
    const a = (i / 6) * TAU
    c.position.set(Math.cos(a) * 0.18, 1.2, -0.14 + Math.sin(a) * 0.18)
    c.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7)
    grp.add(c)
  }
  grp.rotation.set(-0.22, 0.3, 0.18)
  return grp
}

/* ================= grapes ================= */
export function grapes() {
  const r = rng(44)
  const pts: THREE.Vector3[] = []
  let tries = 0
  while (pts.length < 34 && tries++ < 60000) {
    const y = 0.85 - r() * 2.05
    const R = 0.14 + 0.7 * Math.pow((y + 1.2) / 2.05, 0.8)
    const a = r() * TAU, rr = Math.sqrt(r()) * R
    const p = V(Math.cos(a) * rr, y, Math.sin(a) * rr * 0.8)
    if (pts.some((q) => q.distanceTo(p) < 0.46)) continue
    pts.push(p)
  }
  const grapeGeo = new THREE.SphereGeometry(1, 64, 48)
  const inst = new THREE.InstancedMesh(
    grapeGeo,
    phys({ color: '#ffffff', roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.5, sheenColor: new THREE.Color('#f4f8d8'), sheenRoughness: 0.35, emissive: new THREE.Color('#6b7d10'), emissiveIntensity: 0.3 }),
    pts.length,
  )
  const m = new THREE.Matrix4(), q = new THREE.Quaternion()
  pts.forEach((p, i) => {
    q.setFromEuler(new THREE.Euler(r(), r(), r()))
    const k = 0.9 + r() * 0.2
    m.compose(p, q, V(0.26 * k, 0.29 * k, 0.26 * k))
    inst.setMatrixAt(i, m)
    inst.setColorAt(i, new THREE.Color().setRGB(...((r() < 0.3 ? mix(hex('#c9cf4a'), hex('#e0d86a'), r()) : mix(hex('#8fb336'), hex('#b8cf4a'), r())).map((c) => Math.pow(c, 2.2)) as RGB)))
  })
  const grp = new THREE.Group()
  grp.add(inst)
  grp.add(stem([[0, 0.7, 0], [0.05, 1.05, 0.02], [0.18, 1.3, 0.04], [0.32, 1.42, 0.02]], 0.05, 0.035, '#7d6a38'))
  pts.filter((p) => p.y > 0.3).forEach((p) => grp.add(stem([[0, 0.8, 0], [(p.x) * 0.5, 0.75, p.z * 0.5], [p.x, p.y + 0.25, p.z]], 0.018, 0.014, '#7d7a3a')))
  grp.rotation.set(0.15, 0.3, 0.2)
  return grp
}

/* ================= ice cube ================= */
export function ice() {
  const geo = new RoundedBoxGeometry(1, 1, 1, seg(10, 2), 0.16)
  wobble(geo, 0.025, 2.2, 1)
  const frost = tex(paint(512, 512, (u, v) => 0.5 + fbm(u * 30, v * 30, 1, 4) * 0.35), false)
  const cube = new THREE.Mesh(
    geo,
    phys({
      color: '#ffffff', transmission: 1, thickness: 0.9, ior: 1.31, roughness: 0.05,
      attenuationColor: new THREE.Color('#d8f3ff'), attenuationDistance: 3, bumpMap: frost, bumpScale: 0.5, specularIntensity: 1,
    }),
  )
  cube.userData.noShadow = true
  const cloudGeo = new RoundedBoxGeometry(0.55, 0.5, 0.55, seg(6, 2), 0.2)
  wobble(cloudGeo, 0.06, 3, 3)
  const cloud = new THREE.Mesh(
    cloudGeo,
    new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, roughness: 1, depthWrite: false }),
  )
  cloud.userData.noShadow = true
  const grp = new THREE.Group()
  grp.add(cloud, cube)
  grp.rotation.set(0.45, 0.65, 0.18)
  return grp
}

export const FRUITS = { strawberry, mango, orange, lemon, kiwi, avocado, banana, berries, mint, watermelon, pomegranate, peach, grapes, ice }
