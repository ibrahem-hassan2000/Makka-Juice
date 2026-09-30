/**
 * The live 3D hero cup (lazy chunk — three.js only loads once the visitor is inside the hero).
 * It reuses the render studio's camera, softbox environment and light rig (hero-cup.json), so at yaw 0 our
 * WebGL cup is the sprite stack it replaces. The finale spins it fast and, at full speed, swaps it for the
 * "real" cup (the user's Tripo model): on the way there our cup eases into the real one's proportions, so the
 * silhouette never jumps. Renders on demand only: spin / tilt changes.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { HERO_CUP } from '../components/art/HeroCup'
import makkaUrl from '../assets/models/makka-cup.glb?url'
import tripoUrl from '../assets/models/tripo-cup.glb?url'

/** 'real' = spin into the Tripo model; 'makka' = stay on our own cup */
export type Finale = 'real' | 'makka'

// rim height / rim radius: ours 2.33, the real (Tripo) cup ≈ 1.87 (measured on the GLB, same rim radius)
const REAL_ASPECT = 1.87 / 2.33
/** the real cup is shown 8 % bigger so the finished drink doesn't look smaller than the one that was built */
const REAL_SIZE = 1.08

interface Rig {
  camera: { position: number[]; quaternion: number[]; fov: number }
  lights: { key: number[]; rim: number[]; fill: number[]; env: number; exposure: number }
}

/** same product-photo environment as tools/render/studio.ts */
function studioScene() {
  const scene = new THREE.Scene()
  const room = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true }))
  const pos = room.geometry.getAttribute('position')
  const col: number[] = []
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 30
    const k = 0.16 + 0.22 * Math.max(0, y) + 0.05 * Math.max(0, -y)
    col.push(k, k * 0.98, k * 0.95)
  }
  room.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  scene.add(room)
  const box = (w: number, h: number, p: [number, number, number], power: number, tint = 0xffffff) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(power), side: THREE.DoubleSide }),
    )
    m.position.set(...p)
    m.lookAt(0, 0, 0)
    scene.add(m)
  }
  box(5, 16, [-11, 3, 9], 7, 0xfff4e8)
  box(3, 16, [12, 1, 2], 4)
  box(3, 14, [4, 2, -13], 3.5)
  box(16, 10, [0, 16, 2], 2.2)
  box(20, 6, [0, -10, 6], 0.6, 0xfff0dc)
  return scene
}

/**
 * @param pad the canvas is bigger than the cup box by this factor (x, y) so the straw / garnish never clip while
 *   turning; the camera widens by the same amount, keeping the cup exactly where the sprites were.
 * @param lite phones / tablets: no shadow maps, no transmission (the extra render pass), no condensation,
 *   pixel ratio ≤ 1.5 — the cup is on screen for a 1.4 s blurred spin, the difference doesn't show.
 */
export async function createCup3D(
  canvas: HTMLCanvasElement,
  finale: Finale = 'real',
  pad: [number, number] = [1, 1],
  spinTurns = 4,
  lite = false,
) {
  // the swap happens at the fastest moment of an inOut spin (half way); our cup morphs just before it
  const swapAt = spinTurns / 2
  const morphFrom = swapAt * 0.45
  const rig = HERO_CUP as unknown as Rig
  const dpr = Math.min(lite ? 1.5 : 2, window.devicePixelRatio || 1)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lite || dpr < 1.5, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = rig.lights.exposure
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = !lite
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(studioScene(), 0.02).texture
  scene.environmentIntensity = rig.lights.env
  pmrem.dispose()

  const centre = new THREE.Vector3(0, 1.6, 0)
  const light = ([x, y, z, power]: number[], color: number, shadow = false) => {
    const l = new THREE.DirectionalLight(color, power)
    l.position.set(x, y, z).normalize().multiplyScalar(12).add(centre)
    l.target.position.copy(centre)
    if (shadow) {
      l.castShadow = true
      l.shadow.mapSize.set(1024, 1024)
      Object.assign(l.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 30 })
      l.shadow.bias = -0.0004
      l.shadow.normalBias = 0.04
    }
    scene.add(l, l.target)
  }
  light(rig.lights.key, 0xfff3e3, !lite)
  light(rig.lights.rim, 0xffffff)
  light(rig.lights.fill, 0xfff8f0)

  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(rig.camera.fov / 2)) * pad[1]))
  const camera = new THREE.PerspectiveCamera(fov, (720 / 1008) * (pad[0] / pad[1]), 0.05, 100)
  camera.position.fromArray(rig.camera.position)
  camera.quaternion.fromArray(rig.camera.quaternion)

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const [ours, real] = await Promise.all([
    loader.loadAsync(makkaUrl).then((g) => g.scene),
    finale === 'real' ? loader.loadAsync(tripoUrl).then((g) => g.scene) : Promise.resolve(null),
  ])
  const pivot = new THREE.Group()
  pivot.add(ours)
  if (real) {
    real.scale.setScalar(REAL_SIZE)
    pivot.add(real)
  }
  pivot.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const mat = m.material as THREE.MeshPhysicalMaterial
    const glassy = mat.transmission > 0 || mat.transparent
    m.castShadow = !lite && !glassy
    m.receiveShadow = !lite && !glassy
    if (lite && mat.transmission > 0) {
      // condensation drops would read as white dots without refraction; the wall becomes plain clear plastic
      if ((m as THREE.InstancedMesh).isInstancedMesh) m.visible = false
      mat.transmission = 0
      mat.transparent = true
      mat.opacity = 0.16
      mat.depthWrite = false
      mat.needsUpdate = true
    }
  })
  scene.add(pivot)
  await renderer.compileAsync(scene, camera)
  if (real) real.visible = false

  let turns = 0, yaw = 0, pitch = 0, dirty = true
  const draw = () => {
    if (!dirty) return
    dirty = false
    pivot.rotation.set(pitch, turns * Math.PI * 2 + yaw, 0)
    if (real) {
      const swapped = turns >= swapAt
      real.visible = swapped
      ours.visible = !swapped
      // ease our cup into the real cup's size + proportions while it's already a blur
      const k = THREE.MathUtils.smoothstep(turns, morphFrom, swapAt)
      const w = 1 + (REAL_SIZE - 1) * k
      ours.scale.set(w, w * (1 - (1 - REAL_ASPECT) * k), w)
    }
    renderer.render(scene, camera)
  }
  return {
    /** css size of the cup box; the drawing buffer follows the device pixel ratio (capped at 2) */
    setSize(w: number, h: number) {
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      dirty = true
      draw()
    },
    /** rotation in turns (1 = 360°) */
    setSpin(v: number) {
      if (v === turns) return
      turns = v
      dirty = true
      draw()
    },
    setTilt(x: number, y: number) {
      yaw = x
      pitch = y
      dirty = true
      draw()
    },
    dispose() {
      renderer.dispose()
    },
  }
}

export type Cup3D = Awaited<ReturnType<typeof createCup3D>>
