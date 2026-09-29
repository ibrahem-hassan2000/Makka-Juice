/** Shared building blocks: leaves, sweeps, lathes, physical materials. */
import * as THREE from 'three'
import { fbm, hex, mix, noise3, paint, ramp, smooth, tex, type RGB } from './tex'

/** geometry detail: 1 for the sprite renders, lower for the live-web GLB */
export const Q = { lod: 1 }
export const seg = (n: number, min = 3) => Math.max(min, Math.round(n * Q.lod))

export const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o)

/** smooth a coarse (r, y) profile into lathe points */
export function profile(pts: Array<[number, number]>, n = 90) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal')
  return c.getSpacedPoints(n).map((p, i, a) => new THREE.Vector2(i === 0 || i === a.length - 1 ? Math.max(0, Math.min(p.x, 0.0005)) : Math.max(0, p.x), p.y))
}

/** radius + height of a lathe profile at fraction v (0..1 along the point list) */
export function profileAt(pts: THREE.Vector2[], v: number) {
  const f = v * (pts.length - 1)
  const i = Math.min(pts.length - 2, Math.floor(f))
  const t = f - i
  const a = pts[i], b = pts[i + 1]
  return { r: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dr: b.x - a.x, dy: b.y - a.y }
}

/* ---------- leaves ---------- */
export interface LeafOpts {
  length: number
  width: number
  /** half-width along the leaf, s = 0 (base) → 1 (tip), returns 0..1 */
  shape?: (s: number) => number
  fold?: number
  arch?: number
  twist?: number
  teeth?: number
  colors?: [string, string, string]
  veins?: number
  rugose?: number
  seed?: number
  gloss?: number
}

export function leafGeometry(o: LeafOpts) {
  const { length, width, fold = 0.25, arch = 0.15, twist = 0, teeth = 0, seed = 1 } = o
  const shape = o.shape ?? ((s: number) => Math.pow(Math.sin(Math.PI * Math.pow(s, 0.8)), 0.8))
  const S = seg(56, 10), T = seg(18, 6)
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let i = 0; i <= S; i++) {
    const s = i / S
    let hw = (width / 2) * shape(s)
    if (teeth) {
      const saw = (s * teeth) % 1
      hw *= 1 + 0.09 * (saw < 0.75 ? saw / 0.75 : (1 - saw) / 0.25) * Math.sin(Math.PI * s)
    }
    for (let j = 0; j <= T; j++) {
      const t = -1 + (2 * j) / T
      let x = t * hw
      let y = s * length
      let z = fold * Math.abs(t) * hw - arch * s * s * length
      z += 0.03 * length * noise3(s * 5 + seed, t * 2, seed) * Math.abs(t)
      if (twist) {
        const a = twist * s
        const nx = x * Math.cos(a) - z * Math.sin(a)
        z = x * Math.sin(a) + z * Math.cos(a)
        x = nx
      }
      pos.push(x, y, z)
      uv.push((t + 1) / 2, s)
    }
  }
  for (let i = 0; i < S; i++)
    for (let j = 0; j < T; j++) {
      const a = i * (T + 1) + j, b = a + 1, c = a + T + 1, d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const leafCache = new Map<string, { map: THREE.Texture; bump: THREE.Texture }>()
function leafMaps(o: LeafOpts) {
  const key = JSON.stringify([o.colors, o.veins, o.rugose])
  if (leafCache.has(key)) return leafCache.get(key)!
  const [c0, c1, c2] = (o.colors ?? ['#2f7d32', '#43a047', '#9ccc65']).map(hex) as [RGB, RGB, RGB]
  const n = o.veins ?? 7
  const rug = o.rugose ?? 0
  const field = (u: number, v: number) => {
    const d = Math.abs(u - 0.5)
    const mid = 1 - smooth(0.004, 0.012 + 0.01 * (1 - v), d)
    const q = (v - 0.55 * d) * n
    const f = Math.abs(q - Math.round(q))
    const vein = (1 - smooth(0.02, 0.07, f)) * (1 - smooth(0.3, 0.5, d)) * smooth(0.02, 0.1, d)
    return { d, mid, vein }
  }
  const map = paint(512, 1024, (u, v) => {
    const { d, mid, vein } = field(u, v)
    const k = fbm(u * 6, v * 12, 3.3, 3)
    let c = mix(c1, c0, smooth(0.1, 0.5, d) * 0.6 + k * 0.4)
    c = mix(c, c0, rug * 0.35 * (0.5 + 0.5 * noise3(u * 40, v * 70, 1.7)))
    c = mix(c, c2, Math.max(mid * 0.85, vein * 0.45))
    return c
  })
  const bump = paint(512, 1024, (u, v) => {
    const { mid, vein } = field(u, v)
    const puff = rug * (0.5 + 0.5 * noise3(u * 26, v * 48, 8.1))
    return 0.55 + puff * 0.35 - Math.max(mid, vein) * (0.25 + rug * 0.2) + fbm(u * 30, v * 60, 2, 2) * 0.08
  })
  const r = { map: tex(map), bump: tex(bump, false) }
  leafCache.set(key, r)
  return r
}

export function leaf(o: LeafOpts) {
  const { map, bump } = leafMaps(o)
  const m = phys({
    map,
    bumpMap: bump,
    bumpScale: 2,
    roughness: 0.48,
    clearcoat: o.gloss ?? 0.35,
    clearcoatRoughness: 0.35,
    sheen: 0.25,
    sheenColor: new THREE.Color('#d8f5c0'),
    side: THREE.DoubleSide,
    emissiveMap: map,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.06,
  })
  return new THREE.Mesh(leafGeometry(o), m)
}

/* ---------- sweep a varying cross-section along a curve ---------- */
export function sweep(
  curve: THREE.Curve<THREE.Vector3>,
  radius: (t: number, a: number) => number,
  { segs: segs0 = 200, around: around0 = 48, up = new THREE.Vector3(0, 0, 1), minSegs = 6, minAround = 6 } = {},
) {
  const segs = seg(segs0, minSegs), around = seg(around0, minAround)
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const p = curve.getPointAt(t)
    const T = curve.getTangentAt(t).normalize()
    const N = new THREE.Vector3().crossVectors(up, T).normalize()
    const B = new THREE.Vector3().crossVectors(T, N).normalize()
    for (let j = 0; j <= around; j++) {
      const a = (j / around) * Math.PI * 2
      const r = radius(t, a)
      const q = p.clone().addScaledVector(N, Math.cos(a) * r).addScaledVector(B, Math.sin(a) * r)
      pos.push(q.x, q.y, q.z)
      uv.push(j / around, t)
    }
  }
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < around; j++) {
      const a = i * (around + 1) + j, b = a + 1, c = a + around + 1, d = c + 1
      idx.push(a, b, c, b, d, c)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** displace a geometry along its normals with 3D noise (keeps organic shapes from looking lathe-perfect) */
export function wobble(g: THREE.BufferGeometry, amp: number, freq: number, seed = 0) {
  g.computeVertexNormals()
  const p = g.getAttribute('position'), n = g.getAttribute('normal')
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const k = fbm(x * freq + seed, y * freq, z * freq, 3) * amp
    p.setXYZ(i, x + n.getX(i) * k, y + n.getY(i) * k, z + n.getZ(i) * k)
  }
  g.computeVertexNormals()
  return g
}

export const stemMat = (c = '#6b7a35') =>
  phys({ color: new THREE.Color(c), roughness: 0.6, clearcoat: 0.2, sheen: 0.3, sheenColor: new THREE.Color('#c8d8a0') })

export function stem(points: Array<[number, number, number]>, r0: number, r1 = r0 * 0.7, color?: string) {
  const c = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  const g = sweep(c, (t) => r0 + (r1 - r0) * t, { segs: 40, around: 16, up: new THREE.Vector3(1, 0, 0.3).normalize() })
  return new THREE.Mesh(g, stemMat(color))
}

export { ramp }
