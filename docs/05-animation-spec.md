# 05 — Motion spec (as built)

## Preloader (~1.6 s + font wait)
Logo spins/pops in (back.out) · «بنعصرلك…» + ٠٪→١٠٠٪ counter · green juice wave rises to fill the screen ·
logo pops and fades · panel lifts (yPercent −100, expo.inOut 1.1 s) · READY.

## Hero — "the juice builds itself" (pinned, +420 % of viewport, scrub 0.9)
The cup is a 3D render split into stacked sprites (docs/10); the fruit are 3D sprites too.
Intro on READY: headline words rise from masks (expo.out, stagger .09) · cup rises in · 10 fruits pop in
(back.out, stagger .05) · side copy + scroll hint fade up. Idle: every fruit floats (sine yoyo). Mouse parallax on the
fruit layer (±26/18 px).

| timeline | what happens |
|---|---|
| 0 → 1.2 | «لو عصير…» / «يبقى مكة» drift apart and dim to 12 % · intro chrome fades · fill meter appears |
| 1.0 / 3.4 / 5.8 | per layer: its 2 fruits arc into the cup mouth (x ease power1.inOut, y up then down, spin, shrink, fade) |
| hit + 0 | 8 glossy juice droplets (3D sprites) burst and fall · the layer is poured **on top of the previous surface**: its column is revealed from that level up (window/counter-translate, transforms only) while its surface ellipse rises and widens with the cup's taper |
| | layers: strawberry #e8434f → mango #f9a825 → avocado #b9d86a · step caption 01–03 swaps in/out |
| 8.2 → 9.9 | step 04 · ice cubes drop (bounce.out) · cream pops · pink straw drops in · kiwi/strawberry/mint garnish pops |
| 9.9 → end | background flips to Makka lime · decoration fruits burst outward · cup tilts −4°, scales 1.04 and settles 7 % lower · «مكة على طول» (10rem, 4svh) lands word by word · CTAs |
| 10.05 | **the cup becomes real** — a *timed* spin (not scrubbed, so it's always fast), fired when the story passes this point: the sprites hand over to our WebGL cup at yaw 0 (same camera/lights → same frame), it spins **4 turns in 1.4 s** (power3.inOut); while speeding up it eases into the real cup's size/proportions, and at full speed (2 turns) it swaps to the user's Tripo model under a light motion blur (`blur()` ∝ speed), then lands facing you. Scroll back past it = the same spin in reverse into our cup and the sprites. Afterwards the mouse tilts it (±0.7 rad). three.js loads at 20 % of the hero; if it arrives late the spin replays while the hero is still pinned. `?cup=makka` keeps our cup |
Fill meter (desktop, left) shows the scroll progress as ٪ in Arabic digits. Mouse parallax fades to 0 over the
first 8 % of scroll so every fruit lands exactly in the cup mouth.

## Fruit marquee
Two crossing bands (lime −3°, forest +2°), opposite directions, fruit icons between words; scroll velocity boosts
speed (decays ×0.92/frame). Paused off-screen.

## Story
Paragraph words brighten 14 % → 100 % scrubbed while reading. Stat cards pop in (back.out, alternating tilt) and
count up in plain ink (٢٥+ فرع · ٥٤٨ ألف · ٤٧١+ صنف · ١٧٣٧٠); when a count finishes the number pops (0.6 → 1,
back.out) into "juicy" type — strawberry on lime, mango on berry, kiwi on mango, blueberry on cream.

## Corniche — «ليلة على الكورنيش» (pinned, +230 % of viewport, scrub 1) · after Story
No clicks; everything is told by the scroll (timeline units ≈ 0 → 10):
| t | what happens |
|---|---|
| 0 → 3.6 | sun sinks behind the sea (yPercent 85), its reflection + warm glow fade, sunset sky → dusk |
| 1.8 → 7.8 | the yellow-and-cream tram rolls right → left (power1.inOut); lit windows from 4.4 |
| 2.6 → 5.6 | night sky + night sea, street darkens (overlay 55 %), stars (2 layers), crescent moon rises; chip «المغرب» → «بالليل» |
| 4.7 → 6.1 | corniche lamps switch on one by one (stagger .35); Qaitbay's windows light |
| 6.3 → 7.9 | Makka: warm light inside, light on the pavement, the sign flickers on in lime neon, bulbs under the awning |
| 7.7 → 8.4 | «الشمس تغيب…» then «ومكة تنوّر» (sticker) rise from masks, then a hold |
Idle loops (sea shimmer, star twinkle) run only while the section is on screen. Night glows are twin layers over the
dark overlay (the tram's lit windows move in sync with the tram) → opacity/transform only, no repaints.
Reduced motion: the lit night, no pin.

## Signatures (pinned horizontal)
Track moves right (RTL) by `scrollWidth − innerWidth`, scrub 0.8; lime progress bar; hover tilts the cup −6° and
scales 1.05. Cups are 3D renders (`cup-sig-N`) with each drink's layer colours. Nothing inside a card animates while the track moves (cards are pre-rastered layers). Each card's
backdrop: sun rays behind the cup + the drink name printed 3× tone-on-tone (outlined / filled / outlined, −9°).

## Menu
Tabs: each category's colour (mango/berry/lime/leaf/cocoa) on a sticker pill that slides between tabs (Motion
`layoutId`, spring 420/34); the active tab's fruit tilts −12° and grows; item counts on every tab; fades + arrows
appear only on the side with more tabs. Rows stagger in; Arabic-normalised search. Category title = sticker type.

## Bottles
Five bottles rise at different speeds with scroll (yPercent +22…36 → −6…−16, plus rotation); the «مكة على طول»
band drifts behind. Caps (scrubbed, `top 75%` → `center 45%`): wiggle (unscrew) → pop up → settle hovering above
the bottle and **stay** (then a gentle CSS hover-bob via `.caps-open`); fizz rises and fades. Scroll back = caps
screw back on. Flavour fruits drift around the section.

## Reduced motion
Every section checks `prefersReducedMotion()`: no pins, scrubs, loops or parallax; final states shown
(juicy 17370, counters at their values, map route + pins + landmarks drawn, scooter hidden).

## Branches
Plays by itself once the map is 75 % up the screen (not scrubbed — you always see it finish):
the Makka delivery scooter pops in at the Sahel, rides the route (3.2 s, tilts with the road, exhaust puffs) while
the lime route draws behind it; as it reaches each city the pin pops (back.out), a ring bursts and the city's
landmark springs up (umbrella, lighthouse, palm, dome, pyramids). It rolls off the line, parks beside Cairo, hops,
and the «٢٥ فرع · ٥ محافظات» sticker lands. Picking a city (pin or tab) makes its landmark wiggle; the selected city
pulses. Branch cards: swipe row with snap, arrows, progress thumb; the row nudges sideways once on first view.

## Hotline CTA
1. «17370» fills with lime liquid as the number rises to mid-screen (`--fill` 6 % → 90 %, scrub).
2. Full → each digit pops into its own juice (back.out, stagger .08, slight tilts) and 4 fruits land on the
   number; the liquid layer is hidden and paused. Scroll back up = reverses to the lime liquid.
Hover: digits hop one after another. Section fruits drift past (Floaters).

## Floaters (Story, Menu heading, Bottles, Branches, 17370) — 3D fruit sprites
`ui/Floaters.tsx`: each fruit drifts ±60 %×depth of its own height and spins over its section's scroll (scrub).

## Header
Nav wordmark = sticker «عصير مكة» with a bobbing strawberry and orange; on hover they hop.
- **Below 1024 px (phones, tablets) the bar never hides** (it used to auto-hide and "disappear" after menu jumps /
  flings). Links live in the burger menu there.
- **From 1024 px**: hides after 80 px of scrolling down, comes back after 16 px up (hysteresis → no flicker);
  `html[data-nav]` drives `--nav-offset` for the sticky menu bar.
Mobile menu: lime circle from the burger, numbered links rise from masks, bobbing fruit in the empty corners
(checked not to overlap any text), sticker slogan.
