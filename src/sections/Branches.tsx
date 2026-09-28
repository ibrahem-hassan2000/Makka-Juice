import { useEffect, useId, useRef, useState, type ComponentType, type SVGProps } from 'react'
import { ICONS, type IconKey } from '../components/art/icons'
import { Boat, Lighthouse, Mosque, Palm, Pyramids, Scooter, Umbrella } from '../components/art/mapArt'
import { btn } from '../components/ui/button'
import { Floaters } from '../components/ui/Floaters'
import { ArrowUpGlyph, PhoneGlyph, PinGlyph, WhatsAppGlyph } from '../components/ui/glyphs'
import { SectionHeading } from '../components/ui/SectionHeading'
import { sticker } from '../components/ui/sticker'
import { BRANCH_COUNT, BRAND, CITIES, mapsLink, type Branch, type City } from '../data/brand'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../lib/gsap'
import { cn, toArabicDigits } from '../lib/utils'

/* ───────── map geometry (map units; the visible window is VB) ───────── */
const VB = { x: 30, y: 0, w: 820, h: 460 }
const left = (x: number) => `${((x - VB.x) / VB.w) * 100}%`
const top = (y: number) => `${((y - VB.y) / VB.h) * 100}%`
const wide = (w: number) => `${(w / VB.w) * 100}%`

const ROUTE = 'M120 150C200 120 280 80 345 92S430 140 470 150 570 180 610 205 680 300 690 370'
const COAST =
  'M0 178C60 172 100 162 140 152 200 132 260 100 330 80 380 66 420 40 470 30 520 22 560 34 610 30 680 24 740 20 800 30 840 36 870 40 900 38'
const NILE = 'M690 460C686 420 676 380 660 330 640 270 600 200 560 140 530 96 500 60 480 34M660 330C690 250 740 150 790 30'
const DELTA = 'M480 34C500 60 530 96 560 140 600 200 640 270 660 330 690 250 740 150 790 30Z'
const WAVES: Array<[number, number]> = [[70, 100], [150, 74], [255, 62], [110, 132], [395, 20], [560, 13], [700, 11], [820, 18]]
const DUNES: Array<[number, number]> = [[150, 318], [262, 282], [300, 392], [430, 350], [185, 420], [470, 428]]
/** where the scooter parks once it has reached Cairo (next to the pin, not on it) */
const PARKING = { x: 752, y: 380 }

/** a real landmark near each branch city: art + bottom-centre anchor + width (map units) */
const LANDMARKS: Record<string, { Art: ComponentType<SVGProps<SVGSVGElement>>; x: number; y: number; w: number }> = {
  coast: { Art: Umbrella, x: 62, y: 178, w: 44 },
  alex: { Art: Lighthouse, x: 296, y: 86, w: 40 },
  beheira: { Art: Palm, x: 398, y: 252, w: 46 },
  gharbia: { Art: Mosque, x: 545, y: 296, w: 46 },
  cairo: { Art: Pyramids, x: 582, y: 436, w: 68 },
}

const CARD_ICONS: IconKey[] = ['strawberry', 'mango', 'orange', 'kiwi', 'watermelon', 'lemon', 'pomegranate', 'avocado', 'banana', 'grapes', 'guava', 'peach']
const twoDigits = (n: number) => toArabicDigits(String(n).padStart(2, '0'))

/** Stylised Nile-delta map (a Makka scooter rides the route and lights every city) + branch finder. */
export function Branches() {
  const root = useRef<HTMLElement>(null)
  const id = useId()
  const [cityId, setCityId] = useState('alex')
  const city = CITIES.find((c) => c.id === cityId)!

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const rider = q('.map-rider')[0] as HTMLElement
      if (prefersReducedMotion()) return // map shows its final state; the scooter stays hidden

      const canvas = q('.map-canvas')[0] as HTMLElement
      const route = q('.map-route')[0] as unknown as SVGPathElement
      const lines = q('.map-route, .map-route-under') as unknown as SVGPathElement[]
      const pins = CITIES.map((c) => q(`[data-pin="${c.id}"] .pin-pop`)[0])
      const marks = CITIES.map((c) => q(`[data-landmark="${c.id}"] .lm-pop`)[0])
      const badge = q('.map-badge')[0]
      const total = route.getTotalLength()

      /* Perf: the path is sampled ONCE here. Per frame the ride only interpolates this table and writes
         transforms / a dash offset — no getPointAtLength, no DrawSVG re-init (it re-measured both paths
         every frame), no layout reads (the map scale is cached by the ResizeObserver below). */
      const N = 400
      const pts = Array.from({ length: N + 1 }, (_, s) => route.getPointAtLength((s / N) * total))
      const sample = (p: number) => {
        const f = gsap.utils.clamp(0, N, p * N)
        const i = Math.min(N - 1, Math.floor(f))
        const [a, b] = [pts[i], pts[i + 1]]
        const t = f - i
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, a: gsap.utils.clamp(-28, 42, deg) }
      }
      // where along the line each city sits (0 → 1)
      const at = CITIES.map((c) => {
        let best = 0
        let bestD = Infinity
        pts.forEach((p, s) => {
          const d = (p.x - c.map.x) ** 2 + (p.y - c.map.y) ** 2
          if (d < bestD) [bestD, best] = [d, s / N]
        })
        return best
      })

      // the route draws with a plain dash offset (one style write per frame)
      lines.forEach((l) => {
        l.style.strokeDasharray = `${total} ${total}`
        l.style.strokeDashoffset = String(total)
      })
      const draw = (p: number) => lines.forEach((l) => (l.style.strokeDashoffset = String(total * (1 - p))))

      /* The scooter is an HTML layer moved with transforms only (map units → px; the canvas keeps the map's
         aspect ratio, so one scale factor). The route is its own small SVG layer; the base map never repaints. */
      let k = canvas.clientWidth / VB.w
      const drive = { p: 0 }
      const park = { x: 0, y: 0, a: 0, on: false }
      gsap.set(rider, { xPercent: -50, yPercent: -94, transformOrigin: '50% 94%' })
      const setX = gsap.quickSetter(rider, 'x', 'px')
      const setY = gsap.quickSetter(rider, 'y', 'px')
      const setA = gsap.quickSetter(rider, 'rotation', 'deg')
      const place = () => {
        const s = park.on ? park : sample(drive.p)
        if (!park.on) park.a = s.a
        setX((s.x - VB.x) * k)
        setY((s.y - VB.y) * k)
        setA(s.a)
      }
      place()
      gsap.set(pins, { scale: 0 })
      gsap.set(marks, { scale: 0, yPercent: 25, transformOrigin: '50% 100%' })
      gsap.set(badge, { autoAlpha: 0, scale: 0 })

      const START = 0.45
      const RIDE = 3.2
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(rider, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' })
        .add(() => rider.classList.add('is-riding'), START)
        .to(
          drive,
          {
            p: 1,
            duration: RIDE,
            ease: 'none',
            onUpdate: () => {
              draw(drive.p)
              place()
            },
          },
          START,
        )
        // roll off the line and park beside Cairo, then a happy hop
        .add(() => Object.assign(park, { x: pts[N].x, y: pts[N].y, on: true }))
        .to(park, { x: PARKING.x, y: PARKING.y, a: 0, duration: 0.7, ease: 'power2.out', onUpdate: place })
        .add(() => rider.classList.remove('is-riding'))
        .to('.rider-body', { y: -10, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' })
        .to(badge, { autoAlpha: 1, scale: 1, rotation: -4, duration: 0.6, ease: 'back.out(2.4)' }, '<')

      CITIES.forEach((c, i) => {
        const t = START + at[i] * RIDE
        tl.to(pins[i], { scale: 1, duration: 0.55, ease: 'back.out(3)' }, t)
          .add(() => q(`[data-pin="${c.id}"] .pin-burst`)[0]?.classList.add('is-hit'), t)
          .to(marks[i], { scale: 1, yPercent: 0, duration: 0.7, ease: 'back.out(2.2)' }, t + 0.08)
      })

      ScrollTrigger.create({ trigger: canvas, start: 'top 75%', once: true, onEnter: () => tl.play() })

      // keep the scooter glued to the map when the layout changes size
      const ro = new ResizeObserver(() => {
        k = canvas.clientWidth / VB.w
        place()
      })
      ro.observe(canvas)
      return () => ro.disconnect()
    },
    { scope: root },
  )

  // picking a city makes its landmark give a little wiggle
  const choose = contextSafe((next: string) => {
    setCityId(next)
    if (prefersReducedMotion()) return
    const el = root.current?.querySelector(`[data-landmark="${next}"] .lm-pop`)
    if (el) gsap.fromTo(el, { rotation: -12 }, { rotation: 0, duration: 1, ease: 'elastic.out(1.3, 0.3)', overwrite: 'auto' })
  })

  return (
    <section ref={root} id="branches" className="relative overflow-x-clip bg-forest-950 px-4 py-28 md:px-10 md:py-36">
      <Floaters
        clip={false}
        items={[
          { icon: 'orange', cls: 'top-24 left-[4%] w-[clamp(46px,6vw,100px)] md:top-36', depth: 1.2 },
          { icon: 'lemon', cls: 'top-16 left-[30%] hidden w-[clamp(36px,4vw,64px)] md:block', depth: 0.9 },
          // only where the heading leaves the left side empty
          { icon: 'watermelon', cls: 'top-[13rem] left-[12%] hidden w-[clamp(52px,6vw,96px)] xl:block', depth: 1.6 },
        ]}
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="فروعنا"
          title="من قلب اسكندرية… لكل مصر"
          accent="لكل مصر"
          lead={`${toArabicDigits(BRANCH_COUNT)} فرع من الساحل لحد القاهرة، ورقم واحد يوصلك بيهم كلهم: ١٧٣٧٠`}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          {/* ───────── map ───────── */}
          <div className="map-wrap relative overflow-hidden rounded-[2rem] border-[3px] border-cream/10 bg-forest-900 p-2 md:rounded-[2.5rem] md:p-5">
            <div className="map-canvas relative aspect-[820/460] w-full">
              {/* 1 · base — static, painted once */}
              <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <pattern id={`${id}fields`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
                    <path d="M0 7h14" stroke="#8fd16f" strokeOpacity=".18" strokeWidth="3" />
                  </pattern>
                </defs>
                {/* the green delta between the two Nile branches */}
                <path d={DELTA} fill={`url(#${id}fields)`} />
                <path d={`${COAST}V0H0Z`} fill="#0b4a2e" />
                {WAVES.map(([x, y]) => (
                  <path key={`${x}-${y}`} d={`M${x - 10} ${y}q5-5 10 0t10 0`} fill="none" stroke="#c6f36b" strokeOpacity=".3" strokeWidth="2.2" strokeLinecap="round" />
                ))}
                <text x="170" y="44" fill="#c6f36b" opacity=".5" fontSize="22" fontWeight="800" textAnchor="middle">
                  البحر المتوسط
                </text>
                {/* lakes: Idku, Burullus, Manzala */}
                <g fill="#0b4a2e" stroke="#8fd16f" strokeOpacity=".35" strokeWidth="2">
                  <ellipse cx="438" cy="54" rx="15" ry="6" />
                  <ellipse cx="603" cy="50" rx="40" ry="9" />
                  <ellipse cx="822" cy="60" rx="24" ry="8" />
                </g>
                <path d={COAST} stroke="#8fd16f" strokeOpacity=".45" strokeWidth="2.5" fill="none" />
                <path d={NILE} stroke="#46a843" strokeOpacity=".6" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d={NILE} stroke="#8fd16f" strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* western desert */}
                <g fill="none" stroke="#f4d58d" strokeOpacity=".28" strokeWidth="2.5" strokeLinecap="round">
                  {DUNES.map(([x, y]) => (
                    <path key={`${x}-${y}`} d={`M${x - 18} ${y}q18-15 36 0M${x + 8} ${y + 10}q10-8 20 0`} />
                  ))}
                </g>
                {/* compass */}
                <g transform="translate(812 160)">
                  <circle r="22" fill="none" stroke="#fff8e7" strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 5" />
                  <path d="M0-26 6 0 0 26-6 0Z" fill="#fff8e7" fillOpacity=".22" />
                  <path d="M0-26 6 0H-6Z" fill="#c6f36b" fillOpacity=".8" />
                  <text y="-33" textAnchor="middle" fontSize="15" fontWeight="800" fill="#c6f36b" opacity=".8">
                    ش
                  </text>
                </g>
                {/* the whole trip, dashed — the lime route draws over it */}
                <path d={ROUTE} stroke="#fff8e7" strokeOpacity=".16" strokeWidth="3" strokeDasharray="2 10" fill="none" strokeLinecap="round" />
              </svg>

              {/* 2 · route — its own layer, the only thing that repaints while it draws */}
              <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="pointer-events-none absolute inset-0 h-full w-full will-change-transform" aria-hidden>
                <path className="map-route-under" d={ROUTE} stroke="#04200f" strokeWidth="11" fill="none" strokeLinecap="round" />
                <path className="map-route" d={ROUTE} stroke="#c6f36b" strokeWidth="5.5" fill="none" strokeLinecap="round" />
              </svg>

              {/* 3 · landmarks, boat, pins, scooter — HTML layers (scale/translate only) */}
              <div
                aria-hidden
                className="pointer-events-none absolute w-[calc(var(--w)*1.35)] -translate-x-1/2 -translate-y-1/2 md:w-(--w)"
                style={{ left: left(214), top: top(84), ['--w' as string]: wide(40) }}
              >
                <Boat className="block h-auto w-full animate-[rock_3.2s_ease-in-out_infinite]" />
              </div>
              {CITIES.map((c) => {
                const L = LANDMARKS[c.id]
                return (
                  <div
                    key={c.id}
                    data-landmark={c.id}
                    aria-hidden
                    // a third bigger on phones, where the whole map is only ~330px wide
                    className="pointer-events-none absolute w-[calc(var(--w)*1.35)] -translate-x-1/2 -translate-y-full md:w-(--w)"
                    style={{ left: left(L.x), top: top(L.y), ['--w' as string]: wide(L.w) }}
                  >
                    <div className="lm-pop will-change-transform">
                      <L.Art className="block h-auto w-full" />
                    </div>
                  </div>
                )
              })}

              {/* pulse on the selected city (compositor-only `scale`) */}
              <span
                aria-hidden
                key={cityId}
                className="pointer-events-none absolute aspect-square w-[5%] -translate-x-1/2 -translate-y-1/2 animate-[pulse-ring_2.2s_ease-out_infinite] rounded-full bg-lime/45"
                style={{ left: left(city.map.x), top: top(city.map.y) }}
              />

              {CITIES.map((c) => {
                const on = c.id === cityId
                return (
                  <button
                    key={c.id}
                    type="button"
                    data-pin={c.id}
                    onClick={() => choose(c.id)}
                    aria-pressed={on}
                    aria-label={`${c.name} — ${toArabicDigits(c.branches.length)} فرع`}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ left: left(c.map.x), top: top(c.map.y) }}
                  >
                    <span className="pin-pop relative block">
                      <span aria-hidden className="pin-burst absolute inset-0 rounded-full bg-lime opacity-0 [&.is-hit]:animate-[ring-burst_.9s_ease-out_both]" />
                      <span
                        className={cn(
                          'relative grid size-6 place-items-center rounded-full border-2 border-forest-950 text-[11px] font-extrabold shadow-[0_3px_0_#04200f] transition-[scale,background-color] duration-300 ease-(--ease-squish) md:size-9 md:border-[3px] md:text-sm',
                          on ? 'scale-125 bg-lime text-forest-900' : 'bg-leaf-500 text-cream hover:scale-110',
                        )}
                      >
                        {toArabicDigits(c.branches.length)}
                      </span>
                      <span
                        className={cn(
                          'absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap transition-colors md:mt-2.5 md:px-2.5 md:text-sm',
                          on ? 'bg-lime text-forest-900' : 'bg-forest-950/85 text-cream',
                        )}
                      >
                        {c.name}
                      </span>
                    </span>
                  </button>
                )
              })}

              <div aria-hidden className="map-rider pointer-events-none invisible absolute top-0 left-0 z-30 w-[max(9%,38px)] will-change-transform">
                <div className="rider-body relative">
                  {[0, 1, 2].map((k) => (
                    <span
                      key={k}
                      className="absolute bottom-[20%] left-[-2%] size-[22%] rounded-full bg-cream/80 opacity-0 in-[.is-riding]:animate-[puff_.7s_ease-out_infinite]"
                      style={{ animationDelay: `${k * 0.23}s` }}
                    />
                  ))}
                  <Scooter className="relative block h-auto w-full" />
                </div>
              </div>

              <p className="map-badge absolute bottom-[3%] left-[2%] z-20 rounded-2xl border-2 border-forest-950 bg-lime px-2.5 py-1 text-[11px] font-extrabold text-forest-900 shadow-[0_4px_0_#04200f] md:px-4 md:py-2 md:text-base">
                {toArabicDigits(BRANCH_COUNT)} فرع · {toArabicDigits(CITIES.length)} محافظات
              </p>
            </div>
          </div>

          {/* ───────── cities ───────── */}
          <div className="flex flex-col">
            <p className="mb-4 hidden text-lg text-cream/60 lg:block">اختار محافظتك — أو دوس عليها في الخريطة</p>
            <div role="tablist" aria-label="المحافظات" className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
              {CITIES.map((c) => {
                const on = c.id === cityId
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={on}
                    aria-controls="branch-list"
                    onClick={() => choose(c.id)}
                    className={btn(on ? 'lime' : 'dark', 'md', 'mb-1 lg:justify-between lg:px-6 lg:py-4 lg:text-xl')}
                  >
                    {c.name}
                    <span
                      className={cn(
                        'grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs md:h-7 md:min-w-7 md:text-sm',
                        on ? 'bg-forest-900 text-lime' : 'bg-lime text-forest-900',
                      )}
                    >
                      {toArabicDigits(c.branches.length)}
                    </span>
                  </button>
                )
              })}
            </div>
            <a
              href={`tel:${BRAND.hotline}`}
              className="group mt-auto hidden items-center gap-4 rounded-[2rem] border-2 border-dashed border-lime/30 p-5 transition-colors hover:bg-white/5 lg:flex"
            >
              <ICONS.cup className="size-14 shrink-0 transition-transform duration-500 ease-(--ease-squish) group-hover:-rotate-12" />
              <span className="text-lg leading-snug text-cream/80">
                مش لاقي فرع جنبك؟
                <span className="block text-2xl font-extrabold text-lime">كلّمنا على ١٧٣٧٠</span>
              </span>
            </a>
            <a
              href={BRAND.links.branches}
              target="_blank"
              rel="noreferrer"
              className="mt-3 hidden items-center gap-2 self-start text-sm font-bold text-cream/60 transition-colors hover:text-cream lg:inline-flex"
            >
              <PinGlyph className="size-4 text-lime" />
              قايمة الفروع على صفحة مكة الرسمية ↗
            </a>
          </div>
        </div>

        <BranchCarousel city={city} />
      </div>
    </section>
  )
}

/* ───────── branch cards: one uniform card per branch, in a swipeable row with arrows + progress ───────── */

function BranchCarousel({ city }: { city: City }) {
  const track = useRef<HTMLUListElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: false })

  const sync = () => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const x = Math.abs(el.scrollLeft) // RTL: scrollLeft runs 0 → negative
    const ratio = Math.max(0.14, el.scrollWidth ? el.clientWidth / el.scrollWidth : 1)
    const p = max > 1 ? x / max : 0
    if (thumb.current) {
      thumb.current.style.width = `${ratio * 100}%`
      thumb.current.style.right = `${p * (1 - ratio) * 100}%`
    }
    const atStart = x < 4
    const atEnd = x > max - 4
    setEdges((e) => (e.atStart === atStart && e.atEnd === atEnd ? e : { atStart, atEnd }))
  }

  useEffect(() => {
    const el = track.current!
    el.scrollTo({ left: 0 })
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [city.id])

  // first time the row shows up: the cards nudge sideways once, so it's obvious there is more to swipe
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      ScrollTrigger.create({
        trigger: track.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const el = track.current!
          if (el.scrollWidth - el.clientWidth < 8) return
          gsap.to(el.children, { x: -44, duration: 0.45, ease: 'power2.out', yoyo: true, repeat: 1, stagger: 0.04, delay: 0.3 })
        },
      })
    },
    { scope: track },
  )

  const step = (dir: 1 | -1) => {
    const el = track.current!
    const card = el.querySelector('li')
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16
    // RTL: the next cards lie to the left
    el.scrollBy({ left: -dir * ((card?.getBoundingClientRect().width ?? 300) + gap), behavior: 'smooth' })
  }

  const arrow = 'size-12 !px-0 disabled:pointer-events-none disabled:opacity-30'

  return (
    <div className="mt-14 md:mt-20">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm font-bold text-cream/60">فروع</p>
          <h3 className={sticker('lime', 'light', 'text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.25] font-extrabold')}>{city.name}</h3>
        </div>
        <div className="flex items-center gap-3 pb-2">
          <span className="text-base font-bold text-cream/60">{toArabicDigits(city.branches.length)} فرع</span>
          <button type="button" onClick={() => step(-1)} disabled={edges.atStart} aria-label="الفروع اللي قبل" className={btn('dark', 'md', arrow)}>
            <ArrowUpGlyph className="size-5 rotate-90" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={edges.atEnd} aria-label="الفروع اللي بعد" className={btn('lime', 'md', arrow)}>
            <ArrowUpGlyph className="size-5 -rotate-90" />
          </button>
        </div>
      </div>

      <ul
        id="branch-list"
        role="tabpanel"
        aria-label={`فروع ${city.name}`}
        ref={track}
        onScroll={sync}
        className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-5 md:-mx-10 md:scroll-px-10 md:px-10"
      >
        {city.branches.map((b, n) => (
          <li key={`${city.id}:${b.name}`} className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]">
            <BranchCard branch={b} city={city} n={n} />
          </li>
        ))}
        <li className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]">
          <div className="group flex h-full min-h-72 flex-col justify-between gap-6 rounded-[1.75rem] border-[3px] border-dashed border-lime/40 p-5 text-cream">
            <ICONS.cup className="size-16 transition-transform duration-500 ease-(--ease-squish) group-hover:-rotate-12" />
            <p className="text-2xl leading-snug font-extrabold">
              مش لاقي فرع جنبك؟
              <span className="mt-1 block text-lg font-bold text-cream/65">رقم واحد لكل الفروع… كلّمنا أو ابعت على واتساب.</span>
            </p>
            <div className="flex flex-wrap gap-2 pb-1">
              <a href={`tel:${BRAND.hotline}`} className={btn('lime', 'md')}>
                <PhoneGlyph />
                {toArabicDigits(BRAND.hotline)}
              </a>
              <a href={BRAND.whatsapp.link} target="_blank" rel="noreferrer" className={btn('whatsapp', 'md')}>
                <WhatsAppGlyph />
                واتساب
              </a>
            </div>
          </div>
        </li>
      </ul>

      {/* progress: the lime thumb shows where you are in the row (and that there IS a row to swipe) */}
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <span ref={thumb} className="absolute inset-y-0 right-0 rounded-full bg-lime transition-[right] duration-150" />
      </div>
    </div>
  )
}

function BranchCard({ branch: b, city, n }: { branch: Branch; city: City; n: number }) {
  const Icon = ICONS[CARD_ICONS[n % CARD_ICONS.length]]
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border-[3px] border-cream bg-cream p-5 text-forest-900 shadow-[0_6px_0_var(--color-leaf-600)]">
      <div className="flex items-start justify-between">
        <span className="grid size-12 -rotate-6 place-items-center rounded-full bg-white shadow-[0_3px_0_var(--color-forest-900)] ring-[3px] ring-forest-900">
          <Icon className="size-8" />
        </span>
        <span className="text-outline text-5xl leading-none font-extrabold text-forest-900/25">{twoDigits(n + 1)}</span>
      </div>
      <p className="mt-4 text-xs font-extrabold text-leaf-600">{city.name}</p>
      <h4 className="truncate text-xl leading-snug font-extrabold sm:text-2xl">{b.name}</h4>
      <p className="mt-1 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-forest-900/65">{b.address}</p>
      <p className="mt-3 flex items-center gap-2 text-sm font-bold text-forest-900/80">
        <PhoneGlyph />
        <span dir="ltr">{b.phone ?? BRAND.hotline}</span>
        {!b.phone && <span className="text-xs text-forest-900/45">الخط الساخن</span>}
      </p>
      {/* same two actions on every card, pinned to the bottom so all cards line up */}
      <div className="mt-auto pt-4">
        <div className="grid grid-cols-2 gap-2 border-t-2 border-dashed border-forest-900/15 pt-4 pb-1">
          <a href={mapsLink(b, city)} target="_blank" rel="noreferrer" className={btn('green', 'sm')}>
            <PinGlyph />
            الاتجاهات
          </a>
          <a href={`tel:${b.phone ?? BRAND.hotline}`} className={btn('dark', 'sm')} aria-label={`اتصل بفرع ${b.name}`}>
            <PhoneGlyph />
            اتصل
          </a>
        </div>
      </div>
    </article>
  )
}
