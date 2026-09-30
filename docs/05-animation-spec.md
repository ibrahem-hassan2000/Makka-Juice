# 05 — Motion spec (as built)

**Rule since 2026-09-30 (user: "things move by themselves… heavy"): nothing loops or plays on its own.** Motion is
driven by the scroll (scrubbed) or by the visitor (hover / tap / open menu); a few one-shot entrances play once
when their section comes up. No infinite CSS/GSAP loops on the page (measured: 0 running animations while idle).

## Preloader (~1.6 s + font wait)
Logo spins/pops in (back.out) · «بنعصرلك…» + ٠٪→١٠٠٪ counter · green juice wave rises to fill the screen ·
logo pops and fades · panel lifts (yPercent −100, expo.inOut 1.1 s) · READY.

## Hero — "the juice builds itself" (pinned: +420 % of viewport, scrub 0.9 · phones: +330 %, scrub 0.5)
The cup is a 3D render split into stacked sprites (docs/10); the fruit are 3D sprites too.
Intro on READY: headline words rise from masks (expo.out, stagger .09) · cup rises in · 10 fruits pop in
(back.out, stagger .05) · side copy + scroll hint fade up. While the hero is on screen the fruit float gently (the
one ambient motion kept — it stops once the hero scrolls away). Mouse parallax on the fruit layer (±26/18 px).

| timeline | what happens |
|---|---|
| 0 → 1.2 | «لو عصير…» / «يبقى مكة» drift apart and dim to 12 % · intro chrome fades · fill meter appears |
| 1.0 / 3.4 / 5.8 | per layer: its 2 fruits arc into the cup mouth (x ease power1.inOut, y up then down, spin, shrink, fade) |
| hit + 0 | 8 glossy juice droplets (3D sprites) burst and fall · the layer is poured **on top of the previous surface**: its column is revealed from that level up (window/counter-translate, transforms only) while its surface ellipse rises and widens with the cup's taper |
| | layers: strawberry #e8434f → mango #f9a825 → avocado #b9d86a · step caption 01–03 swaps in/out |
| 8.2 → 9.9 | step 04 · ice cubes drop (bounce.out) · cream pops · pink straw drops in · kiwi/strawberry/mint garnish pops |
| 9.9 → end | background flips to Makka lime · decoration fruits burst outward · cup tilts −4°, scales 1.04 and settles 7 % lower · «مكة على طول» (10rem, 4svh) lands word by word · CTAs |
| 10.05 | **the cup becomes real** — a *timed* spin (not scrubbed, so it's always fast), fired when the story passes this point: the sprites hand over to our WebGL cup at yaw 0 (same camera/lights → same frame), it spins **4 turns in 1.4 s** (power3.inOut); while speeding up it eases into the real cup's size/proportions, and at full speed (2 turns) it swaps to the user's Tripo model under a light motion blur (`blur()` ∝ speed), then lands facing you. Scroll back past it = the same spin in reverse into our cup and the sprites. Afterwards the mouse tilts it (±0.7 rad). The 3D chunk is fetched, compiled and drawn once (hidden) when the page is idle after the intro; phones get a light renderer; weak devices / Save-Data keep the sprites. `?cup=makka` keeps our cup |
Fill meter (desktop, left) shows the scroll progress as ٪ in Arabic digits. Mouse parallax fades to 0 over the
first 8 % of scroll so every fruit lands exactly in the cup mouth.

## Fruit marquee
Two crossing bands (lime −3°, forest +2°), opposite directions, fruit icons between words. **Scroll-driven only**:
the scroll speed is their engine (speed = |velocity| / 250, max 6×) and they glide to a stop (×0.9 per frame) when
the page stops.

## Story
Paragraph words brighten 14 % → 100 % **once**, word after word (stagger .028), when the paragraph is 72 % up the
screen (it used to be scrubbed — every scroll frame repainted the paragraph). Stat cards pop in (back.out,
alternating tilt) and count up in plain ink (٢٥+ فرع · ٥٤٨ ألف · ٤٧١+ صنف · ١٧٣٧٠); when a count finishes the number
pops (0.6 → 1, back.out) into "juicy" type — strawberry on lime, mango on berry, kiwi on mango, blueberry on cream.

## Signatures
**Desktop (≥ 768 px):** pinned horizontal gallery — the track moves right (RTL) by `scrollWidth − innerWidth`,
scrub 0.8; lime progress bar. **Phones:** a native swipe row (snap, title card first) — the pinned gallery cost
~3,500 px of vertical swiping and was the heaviest part of the page. Hover tilts the cup −6° and scales 1.05. Cups
are 3D renders (`cup-sig-N`). The track is one layer; nothing inside a card animates. Each card's backdrop: sun rays
(conic gradient faded into the card colour by a radial gradient on top — no mask-image) + the drink name printed 3×
tone-on-tone (outlined / filled / outlined, −9°, tinted with colour alpha — no group opacity).

## Menu
Tabs: each category's colour (mango/berry/lime/leaf/cocoa) on a sticker pill that slides between tabs (Motion
`layoutId`, spring 420/34); the active tab's fruit tilts −12° and grows; item counts on every tab; fades + arrows
appear only on the side with more tabs. Rows stagger in; Arabic-normalised search. Category title = sticker type.

## Bottles
Five bottles rise at different speeds with scroll (yPercent +22…36 → −6…−16, plus rotation); the «مكة على طول»
band drifts behind. Caps (scrubbed, `top 75%` → `center 45%`): wiggle (unscrew) → pop up → settle lifted above the
bottle and **stay** (no idle hover, no fizz — the SVG fizz repainted the bottles every frame). Scroll back = caps
screw back on. Flavour fruits drift around the section.

## Reduced motion
Every section checks `prefersReducedMotion()`: no pins, scrubs, loops or parallax; final states shown
(juicy 17370, counters at their values, map route + pins + landmarks drawn, scooter hidden).

## Branches
**Scrubbed by the scroll** (map `top 85%` → `bottom 45%`, scrub 0.5) — nothing on the map moves unless the page does:
the Makka delivery scooter pops in at the Sahel and rides the route (tilts with the road) while the lime route draws
behind it; as it reaches each city the pin pops and the city's landmark springs up (umbrella, lighthouse, palm, dome,
pyramids); it rolls off the line, parks beside Cairo, hops, and the «٢٥ فرع · ٥ محافظات» sticker lands. Picking a
city (pin or tab) makes its landmark wiggle; the selected city has a static halo. No boat rocking, no pulsing, no
exhaust puffs. Branch cards: swipe row with snap, arrows, progress thumb (no automatic nudge).

## Hotline CTA
1. «17370» fills with lime juice as the number rises to mid-screen — **transform-only**: a window with a wavy top
   (clip-path polygon) slides down while the lime digits inside slide up by the same % (94 % → 10 %), over a
   lime-outlined copy. (It used to be a background-clip:text fill moved per frame + a sloshing loop — the most
   expensive paint on the page.)
2. Full → each digit pops into its own juice (back.out, stagger .08, slight tilts) and 4 fruits land on the number
   (they stay still); the liquid layer is hidden. Scroll back up = reverses to the lime liquid.
Hover: digits hop one after another. Section fruits drift past (Floaters).

## Floaters (Story, Menu heading, Bottles, Branches, 17370) — 3D fruit sprites
`ui/Floaters.tsx`: each fruit drifts ±60 %×depth of its own height and spins over its section's scroll (scrub).

## Footer
The wordmark rises word by word once; its fruit pop in, then drift/rotate with the scroll (scrub) instead of
bobbing; the liquid edge on top slides with the scroll (xPercent 0 → −25) instead of looping.

## Header
Nav wordmark = sticker «عصير مكة» with a strawberry and an orange perched on it (still; on hover they hop).
- **Below 1024 px (phones, tablets) the bar never hides** (it used to auto-hide and "disappear" after menu jumps /
  flings). Links live in the burger menu there.
- **From 1024 px**: hides after 80 px of scrolling down, comes back after 16 px up (hysteresis → no flicker);
  `html[data-nav]` drives `--nav-offset` for the sticky menu bar.
Mobile menu: lime circle from the burger, numbered links rise from masks, fruit in the empty corners bob **only while
the menu is open** (`.mobile-panel:not([data-open]) * { animation-play-state: paused }`), sticker slogan.
