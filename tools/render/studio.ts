/**
 * The render studio: one WebGL renderer, a soft product-photo light rig, and a capture that renders every
 * object twice (on black and on white) to recover exact alpha — clear plastic, ice and specular highlights
 * keep their partial transparency, so the sprites sit right on any section colour.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
renderer.setPixelRatio(1)
renderer.toneMapping = THREE.NeutralToneMapping
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.localClippingEnabled = true

const pmrem = new THREE.PMREMGenerator(renderer)
const ROOM = pmrem.fromScene(new RoomEnvironment(), 0.035).texture

/** product-photo environment: dim grey sweep + tall softboxes → long clean highlight strips on glossy things */
function studioScene() {
  const scene = new THREE.Scene()
  const room = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 24), new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true }))
  const pos = room.geometry.getAttribute('position')
  const col: number[] = []
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 30
    const k = 0.16 + 0.22 * Math.max(0, y) + 0.05 * Math.max(0, -y)
    col.push(k, k * 0.98, k * 0.95)
  }
  room.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  scene.add(room)
  const box = (w: number, h: number, pos: [number, number, number], power: number, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(power), side: THREE.DoubleSide }))
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    scene.add(m)
  }
  box(5, 16, [-11, 3, 9], 7, 0xfff4e8) // key strip, front-left
  box(3, 16, [12, 1, 2], 4) // right strip
  box(3, 14, [4, 2, -13], 3.5) // back rim strip
  box(16, 10, [0, 16, 2], 2.2) // overhead
  box(20, 6, [0, -10, 6], 0.6, 0xfff0dc) // warm floor bounce
  return scene
}
const STUDIO = pmrem.fromScene(studioScene(), 0.02).texture

export interface Shot {
  /** output size (px) */
  width: number
  height: number
  /** camera yaw / pitch in degrees (0/0 = straight in front; pitch > 0 looks down on the object) */
  yaw?: number
  pitch?: number
  fov?: number
  /** empty border as a fraction of the frame */
  margin?: number
  /** supersampling factor */
  ss?: number
  /** fixed framing instead of auto-fit: camera distance + target */
  fixed?: { distance: number; target: THREE.Vector3 }
  /** env light strength */
  env?: number
  key?: number
  envMap?: 'room' | 'studio'
  /** fixed-scale framing: world point `top` → image fraction `at[0]`, `bottom` → `at[1]` (0 = top edge) */
  span?: { top: THREE.Vector3; bottom: THREE.Vector3; at: [number, number] }
  /** meshes that only occlude (write depth, draw nothing) */
  holdout?: (o: THREE.Object3D) => boolean
}

export interface Capture {
  canvas: HTMLCanvasElement
  /** world point → [x, y] as fractions of the frame (0,0 = top-left) */
  project: (p: THREE.Vector3) => [number, number]
  camera: { position: number[]; quaternion: number[]; fov: number }
}

const HOLDOUT = new THREE.MeshBasicMaterial({ colorWrite: false })

/** trim transparent borders; rect is in fractions of the original frame */
export function crop(c: HTMLCanvasElement, pad = 2) {
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++)
      if (d[(y * c.width + x) * 4 + 3] > 1) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  if (x1 < 0) return { canvas: c, rect: [0, 0, 1, 1] as [number, number, number, number] }
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad)
  x1 = Math.min(c.width - 1, x1 + pad); y1 = Math.min(c.height - 1, y1 + pad)
  const out = document.createElement('canvas')
  out.width = x1 - x0 + 1
  out.height = y1 - y0 + 1
  out.getContext('2d')!.drawImage(c, -x0, -y0)
  const r = (n: number) => Math.round(n * 10000) / 10000
  return { canvas: out, rect: [r(x0 / c.width), r(y0 / c.height), r(out.width / c.width), r(out.height / c.height)] as [number, number, number, number] }
}

function rig(scene: THREE.Scene, radius: number, keyPower = 2.6, center = new THREE.Vector3(), env: 'room' | 'studio' = 'studio') {
  scene.environment = env === 'room' ? ROOM : STUDIO
  const key = new THREE.DirectionalLight(0xfff3e3, keyPower)
  key.position.set(-3.2, 5, 4.5).multiplyScalar(radius).add(center)
  key.target.position.copy(center)
  scene.add(key.target)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  const sc = key.shadow.camera
  sc.left = sc.bottom = -radius * 1.6
  sc.right = sc.top = radius * 1.6
  sc.near = 0.1
  sc.far = radius * 20
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02 * radius
  key.shadow.radius = 5
  const rim = new THREE.DirectionalLight(0xffffff, 1.5)
  rim.position.set(4, 3, -5).multiplyScalar(radius)
  const fill = new THREE.DirectionalLight(0xfff8f0, 0.55)
  fill.position.set(5, -1.5, 3).multiplyScalar(radius)
  scene.add(key, rim, fill)
}

/** every vertex of every mesh, in world space (instanced meshes included) */
function worldPoints(root: THREE.Object3D) {
  const pts: THREE.Vector3[] = []
  const v = new THREE.Vector3()
  const m = new THREE.Matrix4()
  root.updateMatrixWorld(true)
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh || mesh.userData.noFit) return
    const pos = mesh.geometry.getAttribute('position')
    const step = Math.max(1, Math.floor(pos.count / 4000))
    const inst = (mesh as THREE.InstancedMesh).isInstancedMesh ? (mesh as THREE.InstancedMesh) : null
    const count = inst ? inst.count : 1
    for (let k = 0; k < count; k++) {
      if (inst) inst.getMatrixAt(k, m)
      for (let i = 0; i < pos.count; i += inst ? Math.max(1, Math.floor(pos.count / 12)) : step) {
        v.fromBufferAttribute(pos, i)
        if (inst) v.applyMatrix4(m)
        pts.push(v.clone().applyMatrix4(mesh.matrixWorld))
      }
    }
  })
  return pts
}

export function capture(object: THREE.Object3D, shot: Shot): Capture {
  const { width, height, yaw = 0, pitch = 8, fov = 24, margin = 0.06, ss = 2 } = shot
  const W = width * ss
  const H = height * ss
  renderer.setSize(W, H, false)

  const scene = new THREE.Scene()
  scene.add(object)
  object.updateMatrixWorld(true)
  const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere())
  rig(scene, Math.max(sphere.radius, 0.5), shot.key, sphere.center, shot.envMap)
  scene.environmentIntensity = shot.env ?? 0.9
  const swapped: Array<[THREE.Mesh, THREE.Material | THREE.Material[]]> = []
  object.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    if (shot.holdout?.(mesh)) {
      swapped.push([mesh, mesh.material])
      mesh.material = HOLDOUT
      mesh.castShadow = true
      return
    }
    if (!o.userData.noShadow) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })

  const cam = new THREE.PerspectiveCamera(fov, W / H, 0.01, 200)
  const dir = new THREE.Vector3(
    Math.sin(THREE.MathUtils.degToRad(yaw)) * Math.cos(THREE.MathUtils.degToRad(pitch)),
    Math.sin(THREE.MathUtils.degToRad(pitch)),
    Math.cos(THREE.MathUtils.degToRad(yaw)) * Math.cos(THREE.MathUtils.degToRad(pitch)),
  )

  if (shot.span) {
    // solve distance + target height so the two reference points land on the requested rows
    const { top, bottom, at } = shot.span
    const target = new THREE.Vector3(0, (top.y + bottom.y) / 2, 0)
    let dist = 9
    const frac = (p: THREE.Vector3) => (1 - p.clone().project(cam).y) / 2
    for (let it = 0; it < 40; it++) {
      cam.position.copy(target).addScaledVector(dir, dist)
      cam.lookAt(target)
      cam.updateMatrixWorld(true)
      const ft = frac(top), fb = frac(bottom)
      dist *= (fb - ft) / (at[1] - at[0])
      const mid = (ft + fb) / 2
      target.y += (((at[0] + at[1]) / 2 - mid) * 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * dist)
    }
    cam.position.copy(target).addScaledVector(dir, dist)
    cam.lookAt(target)
  } else if (shot.fixed) {
    cam.position.copy(shot.fixed.target).addScaledVector(dir, shot.fixed.distance)
    cam.lookAt(shot.fixed.target)
  } else {
    // auto-fit: centre the projected silhouette and fill the frame minus the margin
    const pts = worldPoints(object)
    const target = sphere.center.clone()
    let dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(fov / 2))
    for (let it = 0; it < 4; it++) {
      cam.position.copy(target).addScaledVector(dir, dist)
      cam.lookAt(target)
      cam.updateMatrixWorld(true)
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
      const p = new THREE.Vector3()
      for (const w of pts) {
        p.copy(w).project(cam)
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y)
      }
      // shift target by the NDC offset (converted to world at target depth), then scale distance
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
      const halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * dist
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0)
      const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1)
      target.addScaledVector(right, cx * halfH * cam.aspect).addScaledVector(up, cy * halfH)
      const fill = Math.max((x1 - x0) / 2, (y1 - y0) / 2)
      dist *= fill / (1 - margin * 2)
    }
    cam.position.copy(target).addScaledVector(dir, dist)
    cam.lookAt(target)
  }
  cam.updateMatrixWorld(true)

  const gl = renderer.getContext()
  const grab = (bg: number) => {
    scene.background = new THREE.Color(bg)
    renderer.render(scene, cam)
    const buf = new Uint8Array(W * H * 4)
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf)
    return buf
  }
  const black = grab(0x000000)
  const white = grab(0xffffff)

  // difference matte: white - black = 1 - alpha; colour = black / alpha (rows come bottom-up)
  const big = document.createElement('canvas')
  big.width = W
  big.height = H
  const ctx = big.getContext('2d')!
  const img = ctx.createImageData(W, H)
  const d = img.data
  for (let y = 0; y < H; y++) {
    const src = (H - 1 - y) * W * 4
    const dst = y * W * 4
    for (let x = 0; x < W * 4; x += 4) {
      const b0 = black[src + x], b1 = black[src + x + 1], b2 = black[src + x + 2]
      const diff = (white[src + x] - b0 + white[src + x + 1] - b1 + white[src + x + 2] - b2) / 765
      const a = Math.min(1, Math.max(0, 1 - diff))
      if (a < 0.006) {
        d[dst + x + 3] = 0
        continue
      }
      d[dst + x] = Math.min(255, b0 / a)
      d[dst + x + 1] = Math.min(255, b1 / a)
      d[dst + x + 2] = Math.min(255, b2 / a)
      d[dst + x + 3] = Math.round(a * 255)
    }
  }
  ctx.putImageData(img, 0, 0)

  const out = document.createElement('canvas')
  out.width = width
  out.height = height
  const o = out.getContext('2d')!
  o.imageSmoothingEnabled = true
  o.imageSmoothingQuality = 'high'
  o.drawImage(big, 0, 0, width, height)

  scene.remove(object)
  scene.traverse((x) => (x as THREE.Light).dispose?.())
  for (const [m, mat] of swapped) m.material = mat
  const project = (p: THREE.Vector3): [number, number] => {
    const q = p.clone().project(cam)
    return [(q.x + 1) / 2, (1 - q.y) / 2]
  }
  const r5 = (x: number) => Math.round(x * 1e5) / 1e5
  return { canvas: out, project, camera: { position: cam.position.toArray().map(r5), quaternion: cam.quaternion.toArray().map(r5), fov } }
}
