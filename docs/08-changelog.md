# 08 — Changelog

## 2026-09-27 — Session 1
**Research**
- Facebook (548K), Instagram (@makkajuiceeg 28.3K), Talabat, menuegypt, aklaa, welp, mat3am → 01.
- Transcribed the full official menu (12 image pages) → `src/data/menu.ts` (21 categories, 455 items) → 03.

**v1 — built (current version)**
- Vite 8 + React 19 + TS + Tailwind 4 + GSAP 3.15 + Lenis + Motion scaffold.
- Hero: pinned SVG scene where fruits fly into the Makka cup and pour layers (strawberry → mango → avocado), ice,
  cream, straw, garnish, lime finale. Fruit marquee, story + stats, signature gallery, searchable menu, bottles,
  branch map, liquid 17370 CTA, preloader, cursor.
- QA fixes during v1: header stuck hidden at top, straw visible before its drop, cream misplaced (svgOrigin → bbox
  origin), intro vs scroll conflict on the side chrome (separate wrapper), outlined marquee text, preloader wave offset.

**v2 — "cinematic" experiment → reverted**
- Tried a photoreal/editorial direction inspired by motionsites.ai (Alexandria/Anton/Mono fonts, framed hero waiting
  for AI footage). User: «ارجع لأول حاجة كانت أحسن» → everything from v2 removed, v1 restored file by file.
- Kept from that pass (pure bug fixes, no visual change): reload always starts at the top
  (`ScrollTrigger.clearScrollMemory('manual')` + scroll-to-top in `App.tsx`).

**Full motion review (every moment, mobile 487px + desktop 1440px, forward + reverse scrub)**
Bugs found and fixed:
1. Menu tab/search + branch finder change page height → every trigger below (bottles, map route, 17370 fill) fired
   ~1500px late. → `ResizeObserver` on `<main>` → debounced `ScrollTrigger.refresh()` (App.tsx).
2. Hero side block sat 97px low; GSAP overwrote Tailwind `-translate-y-1/2`. → positioning on outer wrappers,
   GSAP animates inner `.hero-fade` only (same for the scroll hint, which would break across breakpoints).
3. Preloader juice never rose (`translate-y-full` read as 900px). → start state set in GSAP only.
   Also the wave loop jumped every cycle (−120px vs 288px period) → `slide-half` −50% loop.
4. SplitText masks clipped Arabic dots («في» → «فى», «اللي» → «اللى»). → `wordsClass: 'split-word'` +
   `.split-word-mask` padding with equal negative margin; words start at yPercent 140.
5. Menu sticky bar left a 76px strip of rows above it when the header hid. → `--nav-offset` + `html[data-nav]`.
6. Switching to a short category from deep in a long one dropped the user into Branches. → list scrolls back
   under the bar; active tab scrolls into view; search keeps one key (no fade-out per keystroke).
7. Mobile menu circle opened from the logo side (90%) instead of the burger (9%). → origin from the button;
   Esc closes; link reveal uses fromTo.
8. Cursor dot parked at the top-left corner before the first move. → appears on first mouse move, hides on leave.
9. Bottle names clipped by the section edge. → gentler parallax + more bottom padding.
10. Avocado/kiwi covered «يبقى مكة»; finale title touched the straw on desktop. → repositioned; finale title
    10rem at 4svh and the cup settles 7% lower.
11. Scroll lock during the preloader wouldn't apply in production (Lenis created after the lock). → lock remembered.
12. Ice cubes' opacity bounced with the bounce ease. → separate linear fade.
Polish/perf: fruit float on its own layer (no drop-shadow re-raster), cup drop-shadow filter replaced by static
blurred shadows, meter DOM cached, pointer parallax fades out as the story starts (fruit lands dead-centre),
marquee paused off-screen, 548K counts in thousands, reduced-motion respected in every section, preloader
counter no longer spams screen readers.

**Round 3 — user feedback (mobile search, prices, icons, buttons, bottles, map, 17370, footer, perf)**
- Mobile search dead: hidden header box swallowed taps on the sticky search → header `pointer-events-none`.
- Size labels (شوب/شيخ/زجاجة) under every price (`PriceTags`) in menu rows + signature cards; aligned columns.
- 45 light fruit/food icons (`art/icons.tsx`) + `data/menuIcons.ts` → up to 3 icons per menu item, icons on tabs.
- Makka "sticker" buttons (`ui/button.ts`, `ui/glyphs.tsx`) everywhere.
- Bottles: caps unscrew/pop/fly off on scroll with fizz; «مكة على طول» is now a clean band under the bottles.
- Map route plays by itself (2.4 s) with a juice-drop head; cities light up when reached.
- 17370: liquid tile `preserveAspectRatio='none'` → no gap under the wave.
- New footer: wave edge, columns (discover / branches / social), sticker wordmark with bobbing fruits, back-to-top.
- Heading line-height 1.25 (dots of «ي» were sinking into the next line).
- Perf (measured, prod build, mobile emulation): avg frame 21.5 → 17.8 ms, slow frames 177 → 54, >50 ms 6 → 1.
  Removed backdrop-blur, grain overlay, mix-blend cursor, card cup sway, CSS blur glows, bottle drop-shadow filters,
  SMIL map pulse; gallery cards pre-rastered; story counters no longer change page height (that forced
  ScrollTrigger refreshes mid-scroll); refresh now waits for scroll to settle.

## 2026-09-27/28 — Session 2 (Round 4: sticker type, floating fruit, juicy 17370, new map)
User loved the footer's sticker wordmark and the floating fruit of the CTA → spread both; plus fixes.
- **Sticker type** everywhere it counts (`sticker-text` + `ui/sticker.ts`): nav wordmark with fruit on it
  (`brand/Wordmark.tsx`), hero «يبقى مكة» + finale, one accent phrase per section heading, «أساطير مكة», card names,
  menu category titles (category colour), branches city title, «عطشان؟». → 02.
- **Floating fruit** (`ui/Floaters.tsx`) in the empty corners of Story, Menu heading, Bottles, Branches, 17370, and
  bobbing fruit in the mobile menu panel.
- **17370**: after the lime fill, each digit pops into its own juice with a fruit print (strawberry, mango, kiwi,
  orange, blueberry) and 4 fruits land on it; the liquid layer is then hidden + paused (it repainted every frame).
  Fill/pop now keyed to the number itself (was late on phones).
- **Bottles**: caps no longer vanish — they pop up and stay hovering (bob); caps are HTML layers now (no bottle
  repaint); flavour fruit around the section.
- **Branches rebuilt**: map split into static base SVG / route SVG / HTML layers; more detail (delta fields,
  lakes, waves, dunes, compass, boat, landmarks per city); a Makka delivery scooter rides the route, cities pop with a
  ring burst + landmark, it parks by Cairo, «٢٣ فرع · ٥ محافظات» sticker lands; pins are real buttons.
  Branch finder: uniform cream cards (fruit, number, city, name, 2-line address, phone or 17370, same two buttons),
  swipe row with snap + arrows + progress thumb + a one-time nudge, and a "مش لاقي فرع جنبك؟" card.
- **Signature cards**: sun rays + the drink name printed tone-on-tone behind the cup; sticker names sized with `cqw`
  so the longest («أبو السلاطين») fits on one line.
- **Menu nav**: category-coloured sticker tabs with item counts, fruit tilts on the active tab, edge fades + arrows
  (shown only where more tabs exist), sticker search box, sticker category titles.
- **Long names / every screen**: scripted audit at 320·360·375·414·768·1024·1280·1440 (every text box + all 455
  menu rows + nav + cards). Fixed: stat numbers overflowing at 320 and on tablets (4 columns only from lg), menu
  rows squeezed on tablets (2 columns + 3rd icon only from lg), <360 px phones put prices under the name. Now 0 issues.
- **Perf**: found the real jank — the map ride re-initialised DrawSVG, called getPointAtLength ×3 and forced a
  layout every frame: **15.6 ms → 0.39 ms per frame** (microbenchmark); it ran ~4 s and slowed 17370 + footer too.
  Before the fix, first pass (mobile emu): branches 26 · 17370 38 · footer 32 ms avg; second pass ~17 ms.

## 2026-09-28 — Session 3 (nav, juicy counters, Google Maps, a new section tried + removed)
- **Mobile nav "disappearing"**: it auto-hid on scroll down, so after a menu jump / a fling it stayed gone.
  Now it never hides below 1024 px (links move into the burger there); ≥1024 px it hides with hysteresis
  (80 px down / 16 px up). Solid background (text showed through at 90 %). Hero finale title sits under the bar.
- **Juicy type reused** (user loved the 17370 effect): story counters count in plain ink then pop into juice.
  Shared code: `ui/juice.ts`, `ui/JuicyText.tsx` (17370 refactored onto it).
- **Google Maps**: 11/23 branches matched to their exact listing with evidence → «الاتجاهات» opens the shop
  (`cid` in brand.ts). 12 unconfirmed (same-name shops exist) — list + candidates in 01; user will send links.
- Review fixes: footer columns too narrow on tablets (now 2 cols until lg); mobile-menu fruit overlapping links
  (positions checked numerically); overflow audit clean at 320·360·375·414·768·1024·1440.
- **Tried and removed**: «اعمل كوبايتك» — an interactive cup builder (pick fruits → they fly in and pour, juicy
  name, closest menu drink). User: «حاسه مزعج» → removed entirely (section, nav/footer links, helpers).
  Lesson (also in memory): propose new sections in words first; this client prefers calm, scroll-told moments
  over busy interactive toys.

- **New section «ليلة على الكورنيش»** (the user picked it from 3 proposals: corniche night scene / seasonal fruit
  wheel / real Google ratings). Pinned scroll story after «حكايتنا»: sunset behind Qaitbay → night, tram passes,
  lamps switch on one by one, the Makka sign flickers on, «الشمس تغيب… ومكة تنوّر». Checked on phone (375) at start /
  middle / end and on desktop (1280, by measurement): fixed the moon under the time chip, bulbs hidden behind the shop
  opening, and the desktop line wrapping (now one row each, sized in vw). Main-thread cost per scrubbed frame ≈ 3 ms
  (p95 7.8 ms, dev build).

## 2026-09-28 — Session 4 (official links, branches, menu re-check)
- **«ليلة على الكورنيش» removed** — user: «حسو بدائي». (Two new-section attempts both removed today; keep proposing
  in words first.)
- **Size name fixed: «شبح» not «شيخ»** (menu data, signature cards, docs).
- **Makka's own links** (their Facebook auto-reply): WhatsApp ordering (new sticker tone `whatsapp` + WhatsApp glyph)
  in the 17370 section, mobile menu, desktop nav, footer, and the "no branch near you" card; official menu link
  under the menu; Back to School menu in the Bottles section; official branches page in the footer + branches.
- **Branches = official page (25)**: +العصافرة ٢ +شارع ٤٥ +نادي الزمالك, −العباسية, corrected addresses; Google Maps
  exact listings now 14/25 (+العصافرة ٢, جامعة الأهرام الكندية, مارينا ٤). → 01.
- **Menu re-checked against all official pages** (read at full resolution): prices were all right; ~70 names fixed
  to the printed spelling, the invented «فواكه» prefix in «علب مكة» removed, 16 missing items added (471 total),
  hot dishes column «صغير», decimals shown as ١٫٥. «= …» / «( … )» parts shown as an ingredients line. → 03.
- Ingredients of the signature drinks: not published anywhere (menu, Talabat, aklaa, mat3am) → need the client.
- Review: text/overflow audit clean at 320·360·375·414·768·1024·1280·1440; a harness renders all 471 menu rows at
  each width → 0 issues; branch card title «جامعة الأهرام الكندية» was cut at 320 → smaller on phones.
  Main-thread cost per scroll step (dev build, mobile): 3–7 ms median in every section.
- The browser pane was hidden most of the session (no frame timing / screenshots): layout checks ran anyway (viewport
  emulation works hidden); menu pages were downloaded with browser headers to read them.

**Left to do**
- Real frame-rate check on a phone (`npm run build && npm run preview`) — couldn't measure frames with the pane hidden.
- 11 branch map links, 5 unpriced menu rows, signature recipes — from the client / user.
- 12 branch map links from the user.
- Re-measure the first pass on the prod build (browser pane kept going hidden) + on a real mid-range Android phone.
- Deploy preview + pitch (07, 09).
