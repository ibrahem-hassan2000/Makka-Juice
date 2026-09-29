# 04 — Architecture

## Stack (versions as installed 2026-09-27)
| Layer | Choice | Why |
|---|---|---|
| Build | Vite 8 (Rolldown) + TypeScript 6 | fastest dev/build, tiny output |
| UI | React 19 | component model; no SSR needed for a one-page pitch |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`, tokens in `@theme`) | tokens + utilities, zero runtime |
| Scroll choreography | GSAP 3.15 + ScrollTrigger, SplitText, DrawSVG (all free now), `@gsap/react` `useGSAP` | pinned/scrubbed scenes |
| Smooth scroll | Lenis 1.3 driven by `gsap.ticker` | one RAF for Lenis + ScrollTrigger |
| UI micro-motion | Motion 13 (`motion/react`, `LazyMotion` + lazily loaded `domMax`) | menu chip + list transitions |
| Font | Fontsource self-hosted Baloo Bhaijaan 2 (variable) | no Google Fonts request, unicode-range subsets |
| 3D | three.js 0.186 — offline render studio (`tools/render`) + one lazy live model in the hero | realistic fruit/cups as sprites, no WebGL cost elsewhere |

## Folders
```
docs/                 ← all project knowledge
tools/render/         dev-only 3D render studio (three.js) → src/assets/render/*.webp + models/*.glb  (see 10)
tools/shoot.mjs       QA screenshots through headless Chrome
src/
  assets/render/      3D sprites: fruit, cup-sig-*, hero-* passes + hero-cup.json · assets/models/ GLBs
  data/               brand.ts · menu.ts · signatures.ts · menuIcons.ts (item name → fruit icons)  ← content only
  lib/                gsap.ts (plugins) · lenis.ts (smooth scroll + READY event) · utils.ts · motionFeatures.ts ·
                      cup3d.ts (lazy live 3D hero cup)
  hooks/useMedia.ts   matchMedia hooks (reduced motion, fine pointer)
  components/
    art/              photos.tsx (FRUIT: 3D sprite or icon fallback, render()) · HeroCup (stacked hero passes) ·
                      icons.tsx (45 light icons) · Bottle (body/fizz/cap layers) · mapArt · Cup/fruits (old SVG, unused)
    brand/            MakkaLogo (roundel recreation — swap for official) · Wordmark (sticker «عصير مكة» + fruit)
    layout/           Header · Footer · Preloader · Cursor
    ui/               SectionHeading (accent= sticker phrase) · PricePills · button.ts (sticker buttons) ·
                      sticker.ts (sticker type presets) · glyphs · Floaters (scroll-drifting fruit) ·
                      juice.ts + JuicyText (juice-filled text with a fruit print)
  sections/           JuiceHero · FruitMarquee · Story · Signatures · MenuExplorer · Bottles · Branches · HotlineCTA
```

## Runtime flow
1. `App` clears ScrollTrigger scroll memory and forces scroll to top (the hero story starts at frame 0).
2. `Preloader` locks scroll, fills the screen with juice, waits for the font, then fires `READY` (`lib/lenis.ts`).
3. Sections subscribe with `onReady()` to play their intros; ScrollTriggers are created on mount.
4. `App` refreshes ScrollTrigger after `document.fonts.ready`.

## Performance
- Initial JS ≈ 165 KB gzip (react 66 · gsap+lenis 57 · app ~43). Motion's layout engine is a lazy chunk (28 KB).
- Fruit + cups are pre-rendered 3D WebP sprites (~1 MB total; hero passes + hero fruit eager, the rest lazy);
  everything else is inline SVG. Font subsets by unicode-range.
- three.js (~160 KB gzip) + the cup GLB (~530 KB) load only inside the hero, for the final spin, and render on demand.
- Animations touch transform / opacity (+ CSS vars for the liquid text). Idle loops pause off-screen.
- `prefers-reduced-motion`: no pins/scrub, final states shown.

Rules learned by measuring (prod build, mobile emulation — see 08 for numbers):
- Anything animated gets its own layer and only changes transform/opacity: map pins/landmarks/scooter and bottle
  caps are HTML layers over static SVG; floaters/cards/juicy digits have `will-change: transform`.
- Nothing per frame may re-measure: no `getPointAtLength` / DrawSVG re-init / `clientWidth` inside onUpdate
  (the map ride samples its path once and draws with a dash offset; the scale is cached by a ResizeObserver).
- No backdrop-filter, mix-blend, full-screen grain, animated CSS blur/drop-shadow, SMIL.
- Page height must not change while scrolling (it forces a full ScrollTrigger refresh); App.tsx refreshes only
  after scroll settles.
- Hidden-behind-something continuous paint gets paused (17370 liquid once the juicy digits cover it, hero `.is-idle`).

## Commands
```bash
npm install
npm run dev        # launch.json runs it on port 5190
npm run build      # tsc -b && vite build → dist/
npm run preview
npm run lint       # oxlint
```
