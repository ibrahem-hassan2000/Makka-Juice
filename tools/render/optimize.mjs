/**
 * Squeeze the exported GLBs for the web: dedupe, weld, quantize and meshopt-compress the geometry
 * (EXT_meshopt_compression — the page decodes it with three's MeshoptDecoder).
 *   node tools/render/optimize.mjs src/assets/models/makka-cup.glb …
 */
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, quantize, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { statSync } from 'node:fs'

await MeshoptDecoder.ready
await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
})

for (const file of process.argv.slice(2)) {
  const before = statSync(file).size
  const doc = await io.read(file)
  await doc.transform(dedup(), weld(), prune(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'high' }))
  await io.write(file, doc)
  console.log(`${file}: ${(before / 1024).toFixed(0)} KB → ${(statSync(file).size / 1024).toFixed(0)} KB`)
}
