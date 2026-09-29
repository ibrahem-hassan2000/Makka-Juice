/** Trial: the user's Tripo image-to-3D cup (models/tripo-cup.glb), lit in the same studio as our own cup. */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Shot } from './studio'

let cached: Promise<THREE.Object3D> | null = null

export function tripoCup() {
  cached ??= new GLTFLoader().loadAsync(new URL('./models/tripo-cup.glb', import.meta.url).href).then((gltf) => {
    const root = gltf.scene
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      // the export has no normals and no index: weld, then smooth
      let g = m.geometry
      g.deleteAttribute('normal')
      g = mergeVertices(g, 1e-5)
      g.computeVertexNormals()
      m.geometry = g
      const src = m.material as THREE.MeshStandardMaterial
      src.map!.anisotropy = 16
      m.material = new THREE.MeshPhysicalMaterial({
        map: src.map, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.15,
        emissiveMap: src.map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.05, side: THREE.DoubleSide,
      })
    })
    // same height as our cup body + garnish (≈ 3.3 units), standing on y = 0
    const box = new THREE.Box3().setFromObject(root)
    const s = 3.3 / (box.max.y - box.min.y)
    root.scale.setScalar(s)
    root.position.y = -box.min.y * s
    return root
  })
  return cached.then((r) => r.clone())
}

const shot = (yaw: number): Shot => ({ width: 460, height: 644, yaw, pitch: 9, fov: 22, margin: 0.04 })
export const TRIPO = [0, 90, 180, 270].map((yaw) => ({ name: `tripo-${yaw}`, build: tripoCup, shot: shot(yaw) }))
