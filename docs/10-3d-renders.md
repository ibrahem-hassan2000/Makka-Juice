# 10 — 3D renders (fruit, cups, hero cup, live model)

Since 2026-09-29 the fruit decoration and every cup on the site are **real 3D renders**, not flat SVG. They are made
by a small render studio in `tools/render/` (dev only — never shipped) and saved as transparent WebP sprites in
`src/assets/render/`. The page shows plain images (no WebGL cost), except the hero's final spin, which loads a
live three.js model on demand.

## What exists
| Output | Where it's used | Size |
|---|---|---|
| 13 fruit sprites (384², WebP): strawberry, mango, orange, lemon, kiwi, avocado, banana, berries, mint, watermelon, pomegranate, peach, grapes | `FRUIT` in `components/art/photos.tsx` → Floaters (every section), mobile menu, footer, 17370 landing fruit, nav wordmark, branch cards, hero fruit | 8–35 KB each |
| `cup-sig-0…8` (460×644) | signature cards (`Signatures.tsx`), layer colours from `data/signatures.ts` | ~40 KB each |
| `hero-*` passes + `hero-cup.json` | `components/art/HeroCup.tsx` (the pour) | ~300 KB total |
| `src/assets/models/makka-cup.glb` | live hero spin (`lib/cup3d.ts`) | ~530 KB (meshopt) |
| `src/assets/models/tripo-cup.glb` | the user's Tripo image-to-3D cup = the "real cup" the hero spins into | ~300 KB |

Small menu / marquee icons stay flat SVG (`icons.tsx`); `FRUIT[key]` falls back to the SVG icon for fruit we
haven't rendered (guava, pineapple, dates…). The old SVG `Cup.tsx` / `fruits.tsx` are no longer imported.

## How the studio works
- `studio.ts` — one WebGL renderer, a **product-photo environment** (dim sweep + tall softboxes → clean highlight
  strips on plastic), key/rim/fill lights with soft shadows, Neutral tone mapping. Every object is rendered **twice,
  on black and on white**, and the difference gives exact alpha: clear plastic, ice and highlights keep their
  partial transparency on any section colour. Auto-framing, or `span` framing (a world point → an image row) so all
  cups line up with the old SVG proportions (rim ≈ 28 %, base ≈ 96 % of the height).
- `tex.ts` — seeded noise + per-pixel canvas painters (every texture is procedural). `parts.ts` — leaves, sweeps,
  lathes, `Q.lod` (geometry detail: 1 for sprites, 0.25 for the web GLB).
- `fruits.ts` — each fruit is modelled: citrus slices with juice vesicles + membranes, strawberry with seeds in
  dimples + draped calyx, kiwi seed ring, avocado pit, pomegranate arils, grape bloom, mint rugose leaves…
- `cup.ts` — the Makka cup: transmissive PET wall + rolled rim, the dark-green print (six wave lines + «لو عصير /
  يبقى / مكة» in Baloo Bhaijaan 2) on a shell, layered juice with pulp flecks, whipped-cream swirl (star-nozzle
  sweep), pink straw, ice, kiwi/strawberry/mint garnish, condensation (kept off the slogan).
- `heroPasses()` — the hero cup as **stackable sprites from one camera**: back wall → straw → juice columns (top
  layer at the back) → juice surfaces → ice → front wall (print + shine) → cream → garnish. Holdouts (depth-only
  meshes) cut what should be hidden (ice under the juice, garnish sunk in the cream). Each sprite is cropped and its
  rect saved (fractions of the 720×1008 frame) with the liquid levels, the surface scale per level, the rim row and
  the camera + light rig → `hero-cup.json`.

### How the pour works on the page (JuiceHero)
Each juice column sits in a window with `overflow:hidden`; the window slides down while the picture slides up by
the same %, so the level rises with transforms only. A new layer starts at the previous surface (physically right)
and its surface ellipse rises with it, scaling with the cup's taper (`surfaceScale`). Everything is a % from the JSON
— nothing is measured while scrolling.

### The live spin — "the cup becomes real" (hero finale)
User's idea (2026-09-29): once the toppings are in, the built cup spins very fast and turns into the real one
without the change showing. `lib/cup3d.ts` (lazy chunk: three.js + GLTFLoader + MeshoptDecoder, ~160 KB gzip) is
fetched, compiled and drawn once (hidden) in an idle callback right after the hero intro — so its one-time cost
(seconds on a throttled phone) never lands mid-scroll; the 20 %-of-hero trigger is only a fallback. Phones/tablets
(coarse pointer or < 768 px) get a **light renderer**: no shadow maps, no transmission pass (the wall becomes plain
transparent plastic, condensation hidden), pixel ratio ≤ 1.5. Weak devices (deviceMemory < 4, < 4 cores), Save-Data
and reduced motion keep the sprites (no spin). It loads **both** cups and rebuilds
the studio camera, softbox environment and lights from `hero-cup.json`, so at yaw 0 our WebGL cup matches the
sprites. The finale plays a **timed** 4-turn spin (1.4 s, power3.inOut — never slow, whatever the scroll speed):
- turns 0.9 → 2: our cup eases into the real cup's size (×1.08) and proportions (rim height/radius 2.33 → 1.87,
  measured on the GLB), so the silhouette doesn't jump;
- turn 2 (top speed): swap to the Tripo model; the canvas gets a light `blur()` that follows the speed;
- it lands facing the camera; the mouse tilts it a little afterwards.
The canvas is 1.5× wider / 1.2× taller than the cup box (camera widened to match) so the straw/garnish never clip
while turning. It renders **only when the spin/tilt changes** — no render loop. `?cup=makka` = no swap.

## Commands (dev server must be running on :5190)
```bash
node tools/render/run.mjs                          # every sprite (fruit, cup-sig-*, hero passes, drops)
node tools/render/run.mjs strawberry cup hero       # only some (prefix match)
node tools/render/run.mjs glb                       # export makka-cup.glb + tripo-cup.glb
node tools/render/optimize.mjs src/assets/models/makka-cup.glb src/assets/models/tripo-cup.glb
node tools/shoot.mjs <out-dir> 390x844 hero@hero:0.5 menu@#menu   # QA screenshots via headless Chrome
```
`SHEET=<file.png>` on `run.mjs` also writes a contact sheet (each sprite on cream + lime). The studio can be
previewed at `http://localhost:5190/tools/render/?preview&only=kiwi,cup`.

After re-rendering the hero passes, re-export the GLB too (the live model must match the sprites).

## The Tripo model (user's trial, 2026-09-29)
Image-to-3D from Tripo: ~10k triangles, one 4K texture, no normals, 3.4 MB. We weld + smooth it, turn its front to
the camera, shrink the texture to 2K WebP and meshopt the geometry → ~300 KB. Good from the front (photographic
texture), but the plastic is opaque and its print is white, so swapping our cup for it mid-hero shows a different
cup. Now it *is* the finale's "real cup" (swapped in at full spin speed); `?cup=makka` shows ours instead. Source in
`tools/render/models/`.
