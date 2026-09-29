/** GLB exports for the live hero spin: our cup (same parts as the sprites) and the Tripo trial model. */
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { heroModel } from './cup'
import { Q } from './parts'
import { tripoCup } from './tripo'

async function toGLB(root: THREE.Object3D, maxTextureSize = 1024) {
  root.updateMatrixWorld(true)
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    for (const mat of [m.material].flat() as THREE.MeshPhysicalMaterial[]) {
      // glTF has no bump maps; every texture ships as WebP (EXT_texture_webp)
      mat.bumpMap = null
      for (const key of ['map', 'emissiveMap', 'roughnessMap'] as const) {
        const t = mat[key]
        if (t) t.userData.mimeType = 'image/webp'
      }
    }
  })
  const buf = (await new GLTFExporter().parseAsync(root, { binary: true, maxTextureSize })) as ArrayBuffer
  let bin = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

export async function exportGLBs() {
  Q.lod = 0.25
  const ours = await heroModel()
  Q.lod = 1
  const tripo = await tripoCup()
  // Tripo's front faces +x → turn it to face the camera; stand the cup on y = 0, centred on its base
  tripo.rotation.y = -Math.PI / 2
  tripo.updateMatrixWorld(true)
  const wrap = new THREE.Group()
  wrap.add(tripo)
  const box = new THREE.Box3().setFromObject(wrap)
  const s = 2.9 / (box.max.y - box.min.y)
  wrap.scale.setScalar(s)
  wrap.updateMatrixWorld(true)
  const box2 = new THREE.Box3().setFromObject(wrap)
  const base: THREE.Vector3[] = []
  wrap.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const p = m.geometry.getAttribute('position')
    const v = new THREE.Vector3()
    for (let i = 0; i < p.count; i += 3) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld)
      if (v.y < box2.min.y + 0.35 * (box2.max.y - box2.min.y)) base.push(v.clone())
    }
  })
  const c = base.reduce((a, b) => a.add(b), new THREE.Vector3()).divideScalar(base.length)
  wrap.position.set(-c.x, -box2.min.y, -c.z)
  const root = new THREE.Group()
  root.add(wrap)
  return [
    { name: 'makka-cup', data: await toGLB(ours, 1024) },
    { name: 'tripo-cup', data: await toGLB(root, 2048) },
  ]
}
