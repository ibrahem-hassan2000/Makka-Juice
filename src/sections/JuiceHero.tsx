import { useRef, type ComponentType, type SVGProps } from 'react'
import { Cup, CUP_GEOMETRY } from '../components/art/Cup'
import {
  AvocadoHalf,
  Banana,
  Blueberries,
  KiwiSlice,
  LemonSlice,
  Mango,
  MintLeaf,
  OrangeSlice,
  Strawberry,
} from '../components/art/fruits'
import { btn } from '../components/ui/button'
import { MenuGlyph, PhoneGlyph } from '../components/ui/glyphs'
import { sticker } from '../components/ui/sticker'
import { BRAND } from '../data/brand'
import { useReducedMotion } from '../hooks/useMedia'
import { gsap, SplitText, useGSAP } from '../lib/gsap'
import { onReady, scrollToTarget } from '../lib/lenis'
import { toArabicDigits } from '../lib/utils'

/**
 * HERO — "the juice builds itself as you scroll".
 * Pinned scene: fruits fly into the cup, each pair pours a new layer
 * (strawberry → mango → avocado), then ice, cream, straw and garnish land,
 * and the page flips from night-forest to Makka lime.
 * Full choreography spec: docs/05-animation-spec.md
 */

const LAYERS = ['#e8434f', '#f9a825', '#b9d86a']

type Fruit = {
  key: string
  Art: ComponentType<SVGProps<SVGSVGElement>>
  /** tailwind position + size classes */
  cls: string
  /** which liquid layer this fruit pours (null = decoration that bursts outward at the end) */
  layer: number | null
}

const FRUITS: Fruit[] = [
  { key: 'straw-a', Art: Strawberry, layer: 0, cls: 'left-[4%] top-[24%] md:left-[15%] md:top-[18%] w-[clamp(64px,10vw,150px)]' },
  { key: 'straw-b', Art: Strawberry, layer: 0, cls: 'right-[5%] top-[66%] md:right-auto md:left-[20%] md:top-[42%] w-[clamp(56px,8vw,120px)] -rotate-12' },
  { key: 'mango', Art: Mango, layer: 1, cls: 'right-[3%] top-[22%] md:right-[13%] md:top-[14%] w-[clamp(72px,11vw,170px)]' },
  { key: 'orange', Art: OrangeSlice, layer: 1, cls: 'left-[3%] top-[62%] md:left-[12%] md:top-[60%] w-[clamp(64px,9vw,140px)]' },
  // kept clear of «يبقى مكة» so the slogan is never covered
  { key: 'avocado', Art: AvocadoHalf, layer: 2, cls: 'left-[3%] top-[74%] md:left-[25%] md:top-[58%] w-[clamp(60px,8vw,128px)] rotate-12' },
  { key: 'kiwi', Art: KiwiSlice, layer: 2, cls: 'right-[3%] top-[76%] md:right-[25%] md:top-[62%] w-[clamp(56px,7.5vw,118px)]' },
  { key: 'lemon', Art: LemonSlice, layer: null, cls: 'left-[26%] top-[9%] md:left-[31%] md:top-[8%] w-[clamp(40px,5.5vw,86px)]' },
  { key: 'banana', Art: Banana, layer: null, cls: 'right-[24%] top-[6%] md:right-[31%] md:top-[5%] w-[clamp(56px,8vw,130px)]' },
  { key: 'berries', Art: Blueberries, layer: null, cls: 'left-[1%] top-[44%] md:left-[3%] md:top-[22%] w-[clamp(44px,6vw,96px)]' },
  { key: 'mint', Art: MintLeaf, layer: null, cls: 'right-[1%] top-[45%] md:right-[6%] md:top-[74%] w-[clamp(44px,6vw,100px)]' },
]

const STEPS = [
  { n: 1, title: 'فراولة', text: 'أول طبقة… فراولة طازة ومهروسة صح' },
  { n: 2, title: 'مانجو', text: 'وعليها طبقة مانجو دهب' },
  { n: 3, title: 'أفوكادو', text: 'أفوكادو ناعم زي الحرير' },
  { n: 4, title: 'التقفيلة', text: 'تلج، كريمة، وشاليمو بمبي' },
]

export function JuiceHero() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    (_, contextSafe) => {
      if (reduced) return
      const q = gsap.utils.selector(root)
      const stage = root.current!.querySelector<HTMLElement>('.hero-stage')!
      const cupEl = root.current!.querySelector<HTMLElement>('.hero-cup')!
      const { rimY, bottomY, height: cupH } = CUP_GEOMETRY

      /* ---------- intro (after preloader) ---------- */
      const lines = SplitText.create(q('.hero-line'), { type: 'words', mask: 'words', wordsClass: 'split-word' })
      gsap.set(lines.words, { yPercent: 140 })
      gsap.set(q('.fruit-pop'), { scale: 0, rotation: -40 })
      gsap.set(cupEl, { yPercent: 30, autoAlpha: 0 })
      gsap.set(q('.hero-fade'), { autoAlpha: 0, y: 20 })

      const intro = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.3 } })
        .to(lines.words, { yPercent: 0, stagger: 0.09 })
        .to(cupEl, { yPercent: 0, autoAlpha: 1, duration: 1.5 }, 0.15)
        .to(q('.fruit-pop'), { scale: 1, rotation: 0, stagger: 0.05, ease: 'back.out(1.8)', duration: 1 }, 0.3)
        .to(q('.hero-fade'), { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.9 }, 0.6)
      const off = onReady(() => intro.play())

      /* ---------- idle float ---------- */
      const floats = q('.fruit-float').map((el, n) =>
        gsap.to(el, {
          y: n % 2 ? 14 : -14,
          rotation: n % 2 ? 7 : -7,
          duration: 2.2 + (n % 4) * 0.45,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }),
      )

      /* ---------- pointer parallax (desktop) — fades out once the story starts so fruit lands dead-centre ---------- */
      const fx = gsap.quickTo(q('.fruits-layer'), 'x', { duration: 0.9, ease: 'power3' })
      const fy = gsap.quickTo(q('.fruits-layer'), 'y', { duration: 0.9, ease: 'power3' })
      const pointer = { x: 0, y: 0 }
      let parallax = 1
      const applyParallax = () => {
        fx(pointer.x * -26 * parallax)
        fy(pointer.y * -18 * parallax)
      }
      const move = contextSafe!((e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        pointer.x = e.clientX / window.innerWidth - 0.5
        pointer.y = e.clientY / window.innerHeight - 0.5
        applyParallax()
      })
      window.addEventListener('pointermove', move)

      /* ---------- where each fruit has to land ---------- */
      const mouth = () => {
        const ch = cupEl.offsetHeight
        return {
          x: stage.clientWidth / 2,
          y: (stage.clientHeight - ch) / 2 + (ch * (rimY + 40)) / cupH,
        }
      }
      const delta = (el: HTMLElement) => {
        const m = mouth()
        return {
          x: m.x - (el.offsetLeft + el.offsetWidth / 2),
          y: m.y - (el.offsetTop + el.offsetHeight / 2),
        }
      }

      /* ---------- the scrubbed story ---------- */
      const layers = q('.cup-layer') as unknown as SVGGElement[]
      gsap.set(layers, { y: bottomY + 12 })
      gsap.set(q('.cup-ice-cube'), { y: -420, autoAlpha: 0 })
      gsap.set(q('.cup-straw'), { y: -760, autoAlpha: 0 })
      gsap.set(q('.cup-cream'), { scale: 0, transformOrigin: '50% 95%' })
      gsap.set(q('.cup-garnish > g'), { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' })
      gsap.set(q('.hero-step'), { autoAlpha: 0, y: 40 })
      gsap.set(q('.hero-final'), { autoAlpha: 0 })
      gsap.set(q('.hero-final-word'), { yPercent: 140, rotation: 4 })

      const meterNum = q('.meter-num')[0]
      const setMeter = gsap.quickSetter(q('.meter-fill')[0], 'scaleY')
      let lastPct = -1
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.2}`,
          pin: stage,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const pct = Math.round(self.progress * 100)
            if (pct !== lastPct) meterNum.textContent = `${toArabicDigits((lastPct = pct))}٪`
            setMeter(self.progress)
            const next = gsap.utils.clamp(0, 1, 1 - self.progress * 12)
            if (next !== parallax) {
              parallax = next
              applyParallax()
            }
          },
          onToggle: (self) => {
            // once the hero has scrolled away, stop everything that moves inside it (floats + CSS waves/bubbles)
            const live = self.isActive || self.progress === 0
            floats.forEach((t) => (live ? t.play() : t.pause()))
            stage.classList.toggle('is-idle', !live)
          },
        },
      })

      tl.to(q('.hero-line-1'), { yPercent: -35, autoAlpha: 0.12, scale: 0.92, duration: 1.2 }, 0)
        .to(q('.hero-line-2'), { yPercent: 35, autoAlpha: 0.12, scale: 0.92, duration: 1.2 }, 0)
        .to(q('.hero-chrome'), { autoAlpha: 0, duration: 0.6 }, 0)
        .to(q('.hero-meter'), { autoAlpha: 1, duration: 0.4 }, 0.3)

      LAYERS.forEach((_, layer) => {
        const t0 = 1 + layer * 2.4
        const fruits = q(`.fruit[data-layer="${layer}"]`)
        fruits.forEach((el, k) => {
          const t = t0 + k * 0.35
          tl.to(el, { x: () => delta(el).x, duration: 1.2, ease: 'power1.inOut' }, t)
            .to(el, { y: () => delta(el).y - 130, duration: 0.55, ease: 'power2.out' }, t)
            .to(el, { y: () => delta(el).y + 40, duration: 0.65, ease: 'power2.in' }, t + 0.55)
            .to(el, { rotation: k ? -320 : 300, scale: 0.42, duration: 1.2, ease: 'power1.in' }, t)
            .to(el, { autoAlpha: 0, duration: 0.15 }, t + 1.1)
        })
        const hit = t0 + 1.2
        const drops = q(`.cup-splash[data-i="${layer}"] circle`)
        drops.forEach((d) => {
          const dx = Number(d.getAttribute('data-dx'))
          const dy = Number(d.getAttribute('data-dy'))
          tl.fromTo(d, { x: 0, y: 0, autoAlpha: 0 }, { x: dx, y: dy, autoAlpha: 1, duration: 0.35, ease: 'power2.out', immediateRender: false }, hit)
            .to(d, { y: dy + 90, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, hit + 0.35)
        })
        tl.to(layers[layers.length - 1 - layer], { y: () => Number(layers[layers.length - 1 - layer].dataset.top), duration: 1.2, ease: 'power2.out' }, hit - 0.05)
          .to(q('.hero-step')[layer], { autoAlpha: 1, y: 0, duration: 0.5 }, t0 + 0.2)
          .to(q('.hero-step')[layer], { autoAlpha: 0, y: -40, duration: 0.5 }, t0 + 2.2)
        if (layer === 0) tl.to(q('.cup-bubbles'), { autoAlpha: 1, duration: 0.4 }, hit + 0.4)
      })

      const t4 = 1 + LAYERS.length * 2.4
      tl.to(q('.hero-step')[3], { autoAlpha: 1, y: 0, duration: 0.5 }, t4 - 0.2)
        .to(q('.cup-ice-cube'), { y: 0, stagger: 0.14, duration: 0.8, ease: 'bounce.out' }, t4)
        .to(q('.cup-ice-cube'), { autoAlpha: 1, stagger: 0.14, duration: 0.12 }, t4)
        .to(q('.cup-cream'), { scale: 1, duration: 0.6, ease: 'back.out(2.2)' }, t4 + 0.6)
        .to(q('.cup-straw'), { autoAlpha: 1, duration: 0.05 }, t4 + 0.8)
        .to(q('.cup-straw'), { y: 0, duration: 0.7, ease: 'power3.out' }, t4 + 0.8)
        .to(q('.cup-garnish > g'), { scale: 1, autoAlpha: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(2.5)' }, t4 + 1.1)
        .to(q('.hero-step')[3], { autoAlpha: 0, y: -40, duration: 0.4 }, t4 + 1.6)

      /* finale — flip to lime, decor fruits burst outward, headline lands */
      const t5 = t4 + 1.7
      tl.to(q('.hero-bg-lime'), { autoAlpha: 1, duration: 0.8 }, t5)
        .to(q('.hero-line'), { autoAlpha: 0, duration: 0.4 }, t5)
        .to(cupEl, { scale: 1.04, rotation: -4, yPercent: 7, duration: 1, ease: 'power2.out' }, t5)
        .to(q('.fruit[data-layer="none"]'), {
          x: (_i: number, el: HTMLElement) => (el.offsetLeft + el.offsetWidth / 2 - stage.clientWidth / 2) * 0.9,
          y: (_i: number, el: HTMLElement) => (el.offsetTop + el.offsetHeight / 2 - stage.clientHeight / 2) * 0.9,
          scale: 1.6,
          rotation: 90,
          autoAlpha: 0,
          duration: 1,
          ease: 'power2.in',
        }, t5)
        .to(q('.hero-final'), { autoAlpha: 1, duration: 0.3 }, t5 + 0.3)
        .to(q('.hero-final-word'), { yPercent: 0, rotation: 0, stagger: 0.12, duration: 0.8, ease: 'back.out(1.6)' }, t5 + 0.3)
        .to(q('.hero-meter'), { autoAlpha: 0, duration: 0.3 }, t5 + 0.8)
        .to({}, { duration: 0.6 })

      return () => {
        off()
        window.removeEventListener('pointermove', move)
        lines.revert()
      }
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section ref={root} id="top" aria-label="عصير مكة" className="relative">
      <div className="hero-stage relative h-svh w-full overflow-hidden bg-forest-900">
        {/* backgrounds */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,#11603a_0%,#062e18_60%,#04200f_100%)]" />
        <div aria-hidden className="doodles absolute inset-0 opacity-[0.05]" />
        <div
          aria-hidden
          className="hero-bg-lime invisible absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,#8fd16f_0%,#46a843_55%,#2f8f3f_100%)] opacity-0"
        />

        {/* headline behind the cup */}
        <h1 className="sr-only">عصير مكة — لو عصير يبقى مكة</h1>
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          <p className="hero-line hero-line-1 absolute inset-x-0 top-[11svh] text-center text-[clamp(3.6rem,14vw,13rem)] leading-[0.9] font-extrabold text-cream will-change-transform">
            لو عصير…
          </p>
          {/* the Makka sticker type (same as the footer wordmark) */}
          <p
            className={sticker(
              'lime',
              'light',
              'hero-line hero-line-2 absolute inset-x-0 bottom-[5svh] text-center text-[clamp(3.6rem,14vw,13rem)] leading-[0.9] font-extrabold will-change-transform',
            )}
          >
            يبقى مكة
          </p>
        </div>

        {/* fruits */}
        <div className="fruits-layer absolute inset-0">
          {FRUITS.map(({ key, Art, cls, layer }) => (
            <div key={key} className={`fruit absolute will-change-transform ${cls}`} data-layer={layer ?? 'none'}>
              <div className="fruit-pop">
                {/* own layer: the idle float never re-rasterises the drop-shadow */}
                <div className="fruit-float will-change-transform">
                  <Art className="h-auto w-full drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* the cup */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="hero-cup relative aspect-[300/420] h-[56svh] max-h-[640px] will-change-transform">
            {/* static shadow (a CSS drop-shadow on the cup would be recomputed every frame the liquid waves) */}
            <div aria-hidden className="absolute inset-x-[10%] bottom-[-4%] h-[8%] rounded-[50%] bg-black/35 blur-xl" />
            <div aria-hidden className="absolute inset-x-[18%] top-[34%] bottom-[-3%] rounded-[40%] bg-black/25 blur-2xl" />
            <Cup
              layers={LAYERS}
              animated={!reduced}
              print="light"
              className="relative h-full w-full"
              title="كوباية كوكتيل مكة: فراولة، مانجو، أفوكادو، تلج وكريمة"
            />
          </div>
        </div>

        {/* step captions — all stacked in one slot, the timeline swaps them */}
        <ol className="pointer-events-none absolute inset-x-4 bottom-[3svh] h-32 md:inset-x-auto md:bottom-auto md:right-[6vw] md:top-1/2 md:h-48 md:w-[min(26vw,340px)] md:-translate-y-1/2">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="hero-step invisible absolute inset-x-0 bottom-0 rounded-3xl border-2 border-cream/15 bg-forest-950/90 p-4 md:top-0 md:bottom-auto md:border-0 md:bg-transparent md:p-0"
            >
              <span className="block text-sm font-bold tracking-widest text-lime">٠{toArabicDigits(s.n)} / ٠٤</span>
              <span className="block text-4xl leading-tight font-extrabold text-cream md:text-6xl">{s.title}</span>
              <span className="block text-base text-cream/80 md:text-xl">{s.text}</span>
            </li>
          ))}
        </ol>

        {/* fill meter */}
        <div aria-hidden className="hero-meter invisible absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 opacity-0 md:flex">
          <span className="meter-num text-sm font-bold text-lime">٠٪</span>
          <div className="relative h-44 w-2.5 overflow-hidden rounded-full bg-white/15">
            <div className="meter-fill absolute inset-0 origin-bottom scale-y-0 rounded-full bg-gradient-to-t from-berry via-mango to-lime" />
          </div>
          <span className="text-xs text-cream/60 [writing-mode:vertical-rl]">نسبة الامتلاء</span>
        </div>

        {/* intro chrome — .hero-chrome is faded by the scroll timeline, the inner .hero-fade by the intro.
            Positioning (incl. Tailwind translate) lives on the outer wrappers: GSAP owns the inner transforms. */}
        <div className="hero-chrome">
          <div className="absolute right-[6vw] top-1/2 hidden w-[min(22vw,280px)] -translate-y-1/2 md:block">
            <div className="hero-fade">
              <p className="text-sm font-bold tracking-widest text-lime">{BRAND.slogans.origin}</p>
              <p className="mt-2 text-2xl leading-snug font-bold text-cream">
                كوكتيلات وعصاير فريش بتتعمل قدامك… طبقة ورا طبقة.
              </p>
              <dl className="mt-5 flex gap-6">
                <div>
                  <dt className="text-xs text-cream/60">متابع على فيسبوك</dt>
                  <dd className="text-2xl font-extrabold text-cream">٥٤٨ ألف</dd>
                </div>
                <div>
                  <dt className="text-xs text-cream/60">الخط الساخن</dt>
                  <dd className="text-2xl font-extrabold text-lime">{toArabicDigits(BRAND.hotline)}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="absolute bottom-[calc(5svh+clamp(3.6rem,14vw,13rem))] left-1/2 -translate-x-1/2 md:bottom-auto md:left-[5vw] md:top-1/2 md:translate-x-0 md:-translate-y-1/2">
            <button
              type="button"
              onClick={() => scrollToTarget(window.innerHeight * 0.95, 2)}
              className="hero-fade flex flex-col items-center gap-1 text-sm text-cream/80 transition-colors hover:text-cream"
            >
              <span className="whitespace-nowrap md:max-w-[5.5rem] md:text-center md:whitespace-normal">اسحب لتحت واتفرج</span>
              <svg viewBox="0 0 24 36" className="h-8 w-5 animate-bounce" aria-hidden>
                <path d="M12 2C8 10 4 15 4 21a8 8 0 0 0 16 0c0-6-4-11-8-19Z" fill="#c6f36b" />
              </svg>
            </button>
          </div>
        </div>

        {/* finale */}
        <div className="hero-final invisible pointer-events-none absolute inset-0 opacity-0">
          {/* below lg the nav bar never hides, so the title starts under it */}
          <p className="absolute inset-x-0 top-[calc(4svh+72px)] flex md:top-[calc(4svh+84px)] lg:top-[4svh] justify-center gap-[0.22em] overflow-hidden px-2 pt-[0.1em] pb-[0.3em] text-center text-[clamp(3rem,11vw,10rem)] leading-[1] font-extrabold">
            <span className={sticker('cream', 'dark', 'hero-final-word inline-block')}>مكة</span>
            <span className={sticker('mango', 'dark', 'hero-final-word inline-block')}>على</span>
            <span className={sticker('cream', 'dark', 'hero-final-word inline-block')}>طول</span>
          </p>
          <div className="pointer-events-auto absolute inset-x-0 bottom-[6svh] flex flex-wrap items-center justify-center gap-3 px-4">
            <a
              href="#menu"
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget('#menu')
              }}
              className={btn('dark', 'lg')}
            >
              <MenuGlyph />
              شوف المنيو كامل
            </a>
            <a href={`tel:${BRAND.hotline}`} className={btn('cream', 'lg')}>
              <PhoneGlyph />
              اطلب {toArabicDigits(BRAND.hotline)}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
