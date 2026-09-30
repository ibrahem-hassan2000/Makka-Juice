import { useRef } from 'react'
import { Bottle } from '../components/art/Bottle'
import { Floaters } from '../components/ui/Floaters'
import { btn } from '../components/ui/button'
import { MenuGlyph } from '../components/ui/glyphs'
import { SectionHeading } from '../components/ui/SectionHeading'
import { BRAND } from '../data/brand'
import { gsap, prefersReducedMotion, useGSAP } from '../lib/gsap'

const BOTTLES = [
  { juice: '#f3e3c3', label: 'قشطة' },
  { juice: '#f9a825', label: 'مانجو' },
  { juice: '#7e57c2', label: 'توت' },
  { juice: '#ffb74d', label: 'خوخ' },
  { juice: '#e8434f', label: 'فراولة' },
]

/** "مكة على طول" — the take-away bottle line (seen on their Back-to-School campaign). */
export function Bottles() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const section = { trigger: root.current, start: 'top bottom', end: 'bottom top' }

      // gentle range: the labels must never slip under the section's bottom edge
      gsap.utils.toArray<HTMLElement>('.bottle').forEach((el, n) => {
        gsap.fromTo(
          el,
          { yPercent: 22 + (n % 2) * 14, rotation: (n - 2) * -5 },
          { yPercent: -6 - (n % 3) * 5, rotation: (n - 2) * 3, ease: 'none', scrollTrigger: { ...section, scrub: 0.6 } },
        )
      })

      // the caps unscrew (wiggle), pop up and stay hovering over their bottles. (The SVG fizz was removed: moving
      // SVG circles repainted the bottle every frame.)
      // Scrubbed, so scrolling back screws them on again. Caps are HTML layers (see Bottle.tsx) → no repaints.
      const el = root.current!
      const caps = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '.bottles-row',
          start: 'top 75%',
          end: 'center 45%',
          scrub: 0.7,
          // once they're up, each cap idles (CSS bob on an inner element)
          onLeave: () => el.classList.add('caps-open'),
          onEnterBack: () => el.classList.remove('caps-open'),
        },
      })
      gsap.utils.toArray<HTMLElement>('.bottle-cap').forEach((cap, n) => {
        const t = n * 0.18
        const side = n % 2 ? 1 : -1
        caps
          .to(cap, { rotation: -9 * side, transformOrigin: '50% 100%', duration: 0.18 }, t)
          .to(cap, { rotation: 7 * side, duration: 0.18 }, t + 0.18)
          .to(cap, { yPercent: -185, xPercent: 20 * side, rotation: 26 * side, duration: 0.5 }, t + 0.36)
          .to(cap, { yPercent: -150, xPercent: 14 * side, rotation: 12 * side, duration: 0.4, ease: 'sine.inOut' }, t + 0.86)
      })

      // the words behind the bottles run as one clean continuous band
      gsap.fromTo('.bottles-band', { xPercent: -8 }, { xPercent: -42, ease: 'none', scrollTrigger: { ...section, scrub: true } })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="bottles" className="relative overflow-hidden bg-leaf-500 px-5 pt-28 pb-36 md:px-10 md:pt-36 md:pb-52">
      <div aria-hidden className="doodles absolute inset-0 opacity-[0.08]" />
      {/* the flavours in the bottles, drifting around them */}
      <Floaters
        items={[
          { icon: 'mango', cls: 'top-[7%] left-[5%] w-[clamp(52px,7vw,112px)]', depth: 1.4 },
          { icon: 'strawberry', cls: 'top-[12%] right-[5%] w-[clamp(46px,6vw,100px)]', depth: 1 },
          { icon: 'berries', cls: 'top-[50%] left-[3%] w-[clamp(40px,5vw,88px)] md:left-[8%]', depth: 1.8 },
          { icon: 'peach', cls: 'top-[56%] right-[2%] w-[clamp(44px,5.5vw,92px)] md:right-[8%]', depth: 1.2 },
          { icon: 'mint', cls: 'top-[33%] left-[16%] hidden w-[clamp(34px,3.6vw,60px)] md:block', depth: 0.8 },
        ]}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-5 overflow-hidden md:bottom-7" dir="ltr">
        <p className="bottles-band flex w-max text-[clamp(3.2rem,11vw,8.5rem)] leading-[1.25] font-extrabold whitespace-nowrap text-forest-800/40 will-change-transform">
          {Array.from({ length: 6 }, (_, n) => (
            <span key={n} className="flex items-center px-[0.3em]" dir="rtl">
              مكة على طول
              <span className="ms-[0.6em] inline-block size-[0.18em] rounded-full bg-lime/70" />
            </span>
          ))}
        </p>
      </div>
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="مكة على طول"
          title="عصيرك المفضل في زجاجة… معاك في كل حتة"
          accent="معاك في كل حتة"
          accentFill="cream"
          lead="من المدرسة للشغل للمشوار — أغلب أصناف المنيو متاحة في زجاجة ٩٠٠ مل تاخدها معاك."
        />
        <div className="relative mt-7 flex justify-center pb-1">
          <a href={BRAND.links.backToSchool} target="_blank" rel="noreferrer" className={btn('cream', 'md')}>
            <MenuGlyph />
            منيو Back to School
          </a>
        </div>
        <div className="bottles-row mx-auto mt-12 flex max-w-4xl items-end justify-center gap-[2vw]">
          {BOTTLES.map((b, n) => (
            <figure key={b.label} className="bottle relative w-[19%] max-w-[180px] will-change-transform">
              {/* flat shadow instead of a CSS drop-shadow filter (that re-rendered while the caps animate) */}
              <span aria-hidden className="absolute inset-x-[12%] bottom-[2.1em] h-[5%] rounded-[50%] bg-forest-950/25" />
              <Bottle juice={b.juice} n={n} className="w-full" />
              <figcaption className="mt-3 text-center text-sm font-bold text-forest-900 md:text-lg">{b.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
