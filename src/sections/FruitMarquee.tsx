import { useRef } from 'react'
import { ICONS as ART } from '../components/art/icons'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../lib/gsap'

// each word followed by its own fruit (light 48×48 icons — the detailed fruits were costly ×80)
const WORDS = [
  ['مانجو', ART.mango],
  ['فراولة', ART.strawberry],
  ['جوافة', ART.guava],
  ['كيوي', ART.kiwi],
  ['أفوكادو', ART.avocado],
  ['رمان', ART.pomegranate],
  ['أناناس', ART.pineapple],
  ['بطيخ', ART.watermelon],
  ['بلح', ART.dates],
  ['موز', ART.banana],
] as const

/** Two crossing bands that speed up (and flip) with scroll velocity. */
export function FruitMarquee() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tracks = gsap.utils.toArray<HTMLElement>('.marquee-track', root.current)
      // created paused — they only run while the bands are on screen
      const loops = tracks.map((t, n) =>
        n
          ? gsap.fromTo(t, { xPercent: -50 }, { xPercent: 0, duration: 38, ease: 'none', repeat: -1, paused: true })
          : gsap.to(t, { xPercent: -50, duration: 30, ease: 'none', repeat: -1, paused: true }),
      )
      let boost = 0
      const tick = () => {
        boost *= 0.92
        loops.forEach((l) => l.timeScale(1 + boost))
      }
      gsap.ticker.add(tick)
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        onUpdate: (self) => {
          boost = Math.min(6, Math.abs(self.getVelocity()) / 350)
        },
      })
      return () => gsap.ticker.remove(tick)
    },
    { scope: root },
  )

  const row = (outline: boolean) =>
    [0, 1].map((dup) => (
      <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
        {WORDS.map(([w, Icon]) => (
          <span key={w} className="flex items-center">
            <span className={outline ? 'text-outline px-6 text-lime' : 'px-6'}>{w}</span>
            <Icon className="size-[0.8em]" />
          </span>
        ))}
      </div>
    ))

  return (
    <section ref={root} aria-label="الفواكه" className="relative z-10 -my-10 overflow-hidden py-24">
      <div className="-rotate-3 bg-lime py-3 text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-extrabold text-forest-900 shadow-2xl" dir="ltr">
        <div className="marquee-track flex w-max will-change-transform">{row(false)}</div>
      </div>
      <div className="mt-2 rotate-2 bg-forest-800 py-3 text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-extrabold shadow-2xl" dir="ltr">
        <div className="marquee-track flex w-max will-change-transform">{row(true)}</div>
      </div>
    </section>
  )
}
