import { useRef } from 'react'
import { FRUIT } from '../components/art/photos'
import { btn } from '../components/ui/button'
import { Floaters } from '../components/ui/Floaters'
import { JUICE } from '../components/ui/juice'
import { JuicyText } from '../components/ui/JuicyText'
import { BagGlyph, FacebookGlyph, InstagramGlyph, PhoneGlyph, WhatsAppGlyph } from '../components/ui/glyphs'
import { sticker } from '../components/ui/sticker'
import { BRAND } from '../data/brand'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../lib/gsap'

// each digit becomes a different juice with its own fruit print: 1 strawberry · 7 mango · 3 kiwi · 7 orange · 0 blueberry
const JUICES = [
  { ...JUICE.strawberry, tilt: -5 },
  { ...JUICE.mango, tilt: 3 },
  { ...JUICE.kiwi, tilt: -2 },
  { ...JUICE.orange, tilt: 4 },
  { ...JUICE.berries, tilt: -3 },
]

// fruit that lands on the number once it has turned into juice (sized in em → scales with the digits)
const LANDING = [
  { Icon: FRUIT.mint, cls: 'top-[4%] -left-[0.16em] w-[0.26em]', bob: '4.6s' },
  { Icon: FRUIT.strawberry, cls: '-top-[0.06em] left-[44%] w-[0.3em]', bob: '5.4s' },
  { Icon: FRUIT.kiwi, cls: '-bottom-[0.02em] left-[22%] w-[0.26em]', bob: '6s' },
  { Icon: FRUIT.orange, cls: 'bottom-[6%] -right-[0.18em] w-[0.3em]', bob: '5s' },
]

/** The hotline as a glass you fill by scrolling — and once it's full, every digit turns into its own juice. */
export function HotlineCTA() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const digits = gsap.utils.toArray<HTMLElement>('.juicy-digit')
      if (prefersReducedMotion()) {
        gsap.set(digits, { autoAlpha: 1, rotation: (i: number) => JUICES[i].tilt })
        gsap.set('.hotline-fruit', { autoAlpha: 1 })
        gsap.set('.hotline-liquid', { autoAlpha: 0 })
        return
      }
      // 1) scrubbed: the glass fills with lime juice — full exactly when the number reaches mid-screen
      const number = root.current!.querySelector('.hotline-number')
      gsap.fromTo(
        '.hotline-liquid',
        { '--fill': '6%' },
        {
          '--fill': '90%',
          ease: 'none',
          scrollTrigger: { trigger: number, start: 'top 95%', end: 'center 55%', scrub: 0.6 },
        },
      )
      // 2) full → each digit pops into its own fruit juice, fruit lands on top. Scroll back up = back to lime.
      const juicy = gsap
        .timeline({ paused: true })
        .fromTo(
          digits,
          { autoAlpha: 0, scale: 0.5, yPercent: 24, rotation: (i: number) => (i % 2 ? 16 : -16) },
          { autoAlpha: 1, scale: 1, yPercent: 0, rotation: (i: number) => JUICES[i].tilt, stagger: 0.08, duration: 0.75, ease: 'back.out(2.4)' },
        )
        .fromTo('.hotline-fruit', { autoAlpha: 0, scale: 0, rotation: -120 }, { autoAlpha: 1, scale: 1, rotation: 0, stagger: 0.08, duration: 0.8, ease: 'back.out(2)' }, 0.35)
        // hidden under the juice from here on: stop painting the sloshing liquid (it repainted every frame)
        .set('.hotline-liquid', { autoAlpha: 0, animationPlayState: 'paused' })
      ScrollTrigger.create({
        trigger: number,
        start: 'center 55%',
        onEnter: () => juicy.play(),
        onLeaveBack: () => juicy.reverse(),
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="order" className="relative overflow-hidden bg-forest-900 px-5 py-32 text-center md:py-44">
      <div aria-hidden className="doodles absolute inset-0 opacity-[0.05]" />
      <Floaters
        items={[
          { icon: 'strawberry', cls: 'top-[12%] left-[6%] w-[clamp(56px,8vw,120px)]', depth: 1.2 },
          { icon: 'orange', cls: 'right-[7%] bottom-[18%] w-[clamp(56px,8vw,120px)]', depth: 1.6 },
          { icon: 'mint', cls: 'top-[16%] right-[14%] w-[clamp(40px,5vw,80px)]', depth: 1 },
          { icon: 'mango', cls: 'bottom-[12%] left-[14%] w-[clamp(48px,6vw,96px)]', depth: 1.8 },
        ]}
      />

      <div className="relative">
        <p className="text-2xl font-extrabold text-cream md:text-4xl">
          <span className={sticker('mango', 'light', 'me-2 inline-block -rotate-3 text-[1.35em]')}>عطشان؟</span>
          كلّمنا على
        </p>
        <a
          href={`tel:${BRAND.hotline}`}
          className="hotline-number group relative mx-auto mt-2 block w-fit text-[clamp(6rem,25vw,24rem)] leading-[1] font-extrabold tracking-tight"
          dir="ltr"
          aria-label={`اتصل بالخط الساخن ${BRAND.hotline}`}
        >
          {/* py keeps the glyph bottoms inside the box — background-clip:text only fills inside it */}
          <span aria-hidden className="hotline-liquid liquid-text block py-[0.06em]">
            {BRAND.hotline}
          </span>
          {/* the juice layer: same glyphs, one box per digit, laid exactly over the liquid ones */}
          <span aria-hidden className="absolute inset-0 flex py-[0.06em]">
            {[...BRAND.hotline].map((d, n) => (
              <span key={n} className="juicy-digit invisible relative inline-block will-change-transform">
                <span
                  className="block transition-[translate] duration-300 ease-(--ease-squish) group-hover:-translate-y-[0.06em]"
                  style={{ transitionDelay: `${n * 40}ms` }}
                >
                  <JuicyText text={d} juice={JUICES[n].juice} tile={JUICES[n].tile} />
                </span>
              </span>
            ))}
          </span>
          {LANDING.map(({ Icon, cls, bob }, n) => (
            <span key={n} aria-hidden className={`hotline-fruit invisible absolute ${cls}`}>
              <span className="block animate-[bob_var(--bob)_ease-in-out_infinite]" style={{ ['--bob' as string]: bob }}>
                <Icon className="h-auto w-full drop-shadow-[0_0.03em_0.04em_rgba(0,0,0,0.35)]" />
              </span>
            </span>
          ))}
        </a>
        <p className="mx-auto mt-4 max-w-xl text-lg text-cream/70 md:text-xl">رقم واحد لكل الفروع — أو ابعتلنا طلبك على واتساب.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 pb-2">
          <a href={`tel:${BRAND.hotline}`} className={btn('lime', 'lg')}>
            <PhoneGlyph />
            اتصل دلوقتي
          </a>
          <a href={BRAND.whatsapp.link} target="_blank" rel="noreferrer" className={btn('whatsapp', 'lg')}>
            <WhatsAppGlyph />
            اطلب على واتساب
          </a>
          <a href={BRAND.links.talabat} target="_blank" rel="noreferrer" className={btn('talabat', 'lg')}>
            <BagGlyph />
            اطلب من طلبات
          </a>
          <a href={BRAND.links.facebook} target="_blank" rel="noreferrer" className={btn('dark', 'lg')} aria-label="فيسبوك">
            <FacebookGlyph />
            فيسبوك
          </a>
          <a href={BRAND.links.instagram} target="_blank" rel="noreferrer" className={btn('dark', 'lg')} aria-label="إنستجرام">
            <InstagramGlyph />
            إنستجرام
          </a>
        </div>
      </div>
    </section>
  )
}
