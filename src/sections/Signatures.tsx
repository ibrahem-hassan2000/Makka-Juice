import { useRef } from 'react'
import { render } from '../components/art/photos'
import { btn } from '../components/ui/button'
import { MenuGlyph } from '../components/ui/glyphs'
import { PriceTags } from '../components/ui/PricePills'
import { sticker } from '../components/ui/sticker'
import { MENU_ITEM_COUNT } from '../data/menu'
import { SIGNATURES } from '../data/signatures'
import { useMedia, useReducedMotion } from '../hooks/useMedia'
import { gsap, useGSAP } from '../lib/gsap'
import { scrollToTarget } from '../lib/lenis'
import { cn, toArabicDigits } from '../lib/utils'

const SIZES = ['شوب', 'شبح', 'زجاجة ٩٠٠']

/**
 * "أساطير مكة" — the signature (الجديد × جديد) drinks. Desktop: a pinned horizontal gallery driven by the scroll.
 * Phones: a plain swipe row (a pinned sideways gallery cost ~3,500 px of vertical swiping and was the heaviest
 * part of the page on phones).
 */
export function Signatures() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const phone = useMedia('(max-width: 767px)')
  const swipe = reduced || phone

  useGSAP(
    () => {
      if (swipe) return
      const track = root.current!.querySelector<HTMLElement>('.sig-track')!
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      // page is RTL: the track overflows to the left, so it travels right.
      // Perf: the track is ONE layer that slides; nothing inside a card animates while it moves. (Cards used to be
      // a layer each — 9 big textures for nothing; the track layer already keeps them from re-rastering.)
      tl.to(track, { x: () => distance() }, 0).to('.sig-progress', { scaleX: 1 }, 0)
    },
    { scope: root, dependencies: [swipe] },
  )

  return (
    <section
      ref={root}
      id="signatures"
      aria-label="أساطير مكة"
      className={cn('relative overflow-hidden bg-forest-950', swipe ? 'py-20' : 'h-svh')}
    >
      <div aria-hidden className="doodles absolute inset-0 opacity-[0.035]" />
      <div className={cn('relative flex h-full flex-col justify-center', swipe && 'no-scrollbar snap-x snap-mandatory scroll-px-5 overflow-x-auto md:scroll-px-[6vw]')}>
        <div className="sig-track flex w-max items-center gap-5 px-5 md:gap-8 md:px-[6vw]">
          <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center md:w-[34vw]">
            <p className="mb-3 text-sm font-bold tracking-widest text-lime">الجديد × جديد</p>
            <h2 className={sticker('lime', 'light', 'text-[clamp(3rem,7vw,6.5rem)] leading-[1.2] font-extrabold')}>أساطير مكة</h2>
            <p className="mt-5 max-w-md text-lg text-cream/70 md:text-xl">
              أسامي اتعملت في مكة ومحدش عرف يقلّدها… كل واحد فيهم ليه جمهوره.
            </p>
            <p className="mt-8 flex items-center gap-3 text-cream/60">
              <span className="inline-block h-px w-12 bg-cream/40" />
              {swipe ? 'اسحب الكروت بصباعك وشوف الباقي' : 'اسكرول وهي هتعدي قدامك'}
            </p>
          </div>

          {SIGNATURES.map((s, n) => (
            <article
              key={s.name}
              className="group @container relative flex h-[min(70svh,660px)] w-[78vw] shrink-0 snap-center flex-col overflow-hidden rounded-[2.5rem] border-[3px] border-cream/90 p-6 shadow-[0_8px_0_rgba(4,32,15,0.55)] sm:w-[380px] md:p-8"
              style={{ background: s.bg, color: s.ink, ['--card' as string]: s.bg }}
            >
              {/* backdrop: sun rays behind the cup + the drink's name printed tone-on-tone like a juice wrapper —
                  outlined / filled / outlined, sized to the card. Raster-cheap on purpose: the rays fade into the card
                  colour with a gradient on top (no mask-image), the text is tinted with colour alpha (no group opacity). */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[47%] left-1/2 aspect-square w-[175%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,transparent_18%,var(--card)_70%),repeating-conic-gradient(rgba(255,255,255,0.24)_0deg_7deg,transparent_7deg_15deg)]" />
                <div className="absolute inset-x-[-40%] top-[19%] flex -rotate-[9deg] flex-col items-center text-[24cqw] leading-[1.15] font-extrabold">
                  {[0, 1, 2].map((r) => (
                    <p
                      key={r}
                      className={cn('whitespace-nowrap', r === 1 ? 'text-[color-mix(in_srgb,currentColor_12%,transparent)]' : 'text-outline text-[color-mix(in_srgb,currentColor_22%,transparent)]')}
                      style={{ translate: `${(r - 1) * 18}% 0` }}
                    >
                      {[s.name, s.name, s.name].join('  ·  ')}
                    </p>
                  ))}
                </div>
              </div>
              <div className="relative flex items-start justify-between">
                <span className="text-outline text-6xl leading-none font-extrabold text-[color-mix(in_srgb,currentColor_40%,transparent)] md:text-7xl">
                  ٠{toArabicDigits(n + 1)}
                </span>
                <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-bold">من أساطير مكة</span>
              </div>
              <div className="relative -my-2 flex flex-1 items-center justify-center">
                <div aria-hidden className="absolute size-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.4),transparent)]" />
                <div className="sig-cup relative h-full max-h-[320px]">
                  <img
                    src={render(`cup-sig-${n}`)}
                    alt={`كوباية ${s.name}`}
                    width={460}
                    height={644}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-auto transition-transform duration-700 ease-(--ease-squish) select-none group-hover:scale-105 group-hover:-rotate-6"
                  />
                </div>
              </div>
              {/* sized to the card (cqw) so the longest name («أبو السلاطين») still fits on one line */}
              <h3 className={sticker('cream', 'dark', 'relative text-[min(3.2rem,15cqw)] leading-[1.3] font-extrabold whitespace-nowrap')}>{s.name}</h3>
              <p className="relative mb-4 text-lg font-semibold opacity-80">{s.tagline}</p>
              <div className="relative flex items-end justify-between gap-3">
                <PriceTags prices={s.prices} sizes={SIZES} surface="card" />
                <span className="pb-5 text-xs font-bold opacity-60">جنيه</span>
              </div>
            </article>
          ))}

          <div className="flex h-[min(68svh,640px)] w-[78vw] shrink-0 flex-col items-start justify-center rounded-[2.5rem] border-2 border-dashed border-lime/40 p-8 sm:w-[380px]">
            <p className="text-[clamp(2.4rem,4vw,3.4rem)] leading-tight font-extrabold text-cream">
              ولسه فيه <span className={sticker('lime', 'light')}>{toArabicDigits(MENU_ITEM_COUNT)}+</span> صنف تاني
            </p>
            <button type="button" onClick={() => scrollToTarget('#menu')} className={btn('lime', 'lg', 'mt-8')}>
              <MenuGlyph />
              افتح المنيو
            </button>
          </div>
        </div>

        {!swipe && (
          <div className="absolute inset-x-5 bottom-6 h-1 overflow-hidden rounded-full bg-white/10 md:inset-x-[6vw]">
            <div className="sig-progress h-full origin-right scale-x-0 rounded-full bg-lime" />
          </div>
        )}
      </div>
    </section>
  )
}
