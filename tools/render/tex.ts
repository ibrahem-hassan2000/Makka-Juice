/**
 * Procedural texture helpers for the render studio (dev tool, never shipped).
 * Everything is seeded so a re-render gives the same pixels.
 */
import * as THREE from 'three'

/* ---------- seeded random ---------- */
export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- improved Perlin noise (3D) ---------- */
const perm = new Uint8Array(512)
{
  const r = rng(1337)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
}
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function grad(h: number, x: number, y: number, z: number) {
  const hh = h & 15
  const u = hh < 8 ? x : y
  const v = hh < 4 ? y : hh === 12 || hh === 14 ? x : z
  return ((hh & 1) === 0 ? u : -u) + ((hh & 2) === 0 ? v : -v)
}
export function noise3(x: number, y: number, z: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z)
  const u = fade(x), v = fade(y), w = fade(z)
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z
  const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z
  return lerp(
    lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
    lerp(
      lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
      lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u),
      v,
    ),
    w,
  )
}
export function fbm(x: number, y: number, z: number, oct = 4) {
  let a = 0.5, f = 1, s = 0
  for (let i = 0; i < oct; i++) {
    s += a * noise3(x * f, y * f, z * f)
    f *= 2.03
    a *= 0.5
  }
  return s
}

/* ---------- colour ---------- */
export type RGB = [number, number, number]
export const hex = (h: string): RGB => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
export const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
/** multi-stop gradient: stops = [[t, '#hex'], …] sorted by t */
export function ramp(stops: Array<[number, string]>) {
  const s = stops.map(([t, c]) => [t, hex(c)] as [number, RGB])
  return (t: number): RGB => {
    if (t <= s[0][0]) return s[0][1]
    for (let i = 1; i < s.length; i++) {
      if (t <= s[i][0]) return mix(s[i - 1][1], s[i][1], smooth(s[i - 1][0], s[i][0], t))
    }
    return s[s.length - 1][1]
  }
}
export const css = (c: RGB, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`

/* ---------- canvases → textures ---------- */
export function canvas(w: number, h = w) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/**
 * Per-pixel painter in UV space. `fn(u, v)` returns sRGB 0..1 (or a single grey value).
 * v = 1 is the top row of the canvas, matching three's flipY texture convention.
 */
export function paint(w: number, h: number, fn: (u: number, v: number) => RGB | number) {
  const c = canvas(w, h)
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const d = img.data
  for (let y = 0; y < h; y++) {
    const v = 1 - (y + 0.5) / h
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w
      const r = fn(u, v)
      const i = (y * w + x) * 4
      if (typeof r === 'number') {
        const g = Math.round(clamp01(r) * 255)
        d[i] = d[i + 1] = d[i + 2] = g
      } else {
        d[i] = Math.round(clamp01(r[0]) * 255)
        d[i + 1] = Math.round(clamp01(r[1]) * 255)
        d[i + 2] = Math.round(clamp01(r[2]) * 255)
      }
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** unit-sphere point for a SphereGeometry uv (so colour can be a function of 3D position) */
export function spherePoint(u: number, v: number) {
  const phi = u * Math.PI * 2
  const theta = (1 - v) * Math.PI
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta))
}

export function tex(c: HTMLCanvasElement, color = true) {
  const t = new THREE.CanvasTexture(c)
  if (color) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}
