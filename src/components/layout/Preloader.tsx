import { useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useMedia'
import { gsap, useGSAP } from '../../lib/gsap'
import { lockScroll, markReady } from '../../lib/lenis'
import { toArabicDigits, wavePath } from '../../lib/utils'
import { MakkaLogo } from '../brand/MakkaLogo'

const WAVE = wavePath(2400, 60, 14, 240)

/**
 * Short (≈1.6s) "filling the glass" intro. Waits for the Arabic font so the hero
 * never flashes a fallback face, then lifts away and fires the READY event.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      if (reduced) {
        markReady()
        setGone(true)
        return
      }
      lockScroll(true)
      const num = root.current!.querySelector('.pre-num')!
      const state = { p: 0 }
      // start state lives in GSAP only — a Tailwind translate class here gets read as a px offset and the juice never rises
      gsap.set('.pre-liquid', { yPercent: 100 })
      const fill = gsap.timeline()
      fill
        .from('.pre-logo', { scale: 0, rotation: -120, duration: 0.9, ease: 'back.out(1.7)' })
        .to(
          state,
          {
            p: 100,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              num.textContent = `${toArabicDigits(Math.round(state.p))}٪`
            },
          },
          0.1,
        )
        .fromTo('.pre-liquid', { yPercent: 100 }, { yPercent: 0, duration: 1.5, ease: 'power2.inOut' }, 0.1)

      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      Promise.all([fontsReady, fill.then()]).then(() => {
        gsap
          .timeline({
            onComplete: () => setGone(true),
          })
          .to('.pre-logo', { scale: 1.15, duration: 0.25, ease: 'power2.out' })
          .to('.pre-logo, .pre-copy', { autoAlpha: 0, y: -30, duration: 0.35 }, '>-0.05')
          .add(() => {
            lockScroll(false)
            markReady()
          })
          .to(root.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<')
      })
    },
    { scope: root },
  )

  if (gone) return null

  return (
    <div ref={root} className="fixed inset-0 z-[80] overflow-hidden bg-forest-950" role="status" aria-label="جاري التحميل">
      <div className="pre-liquid absolute inset-0">
        <svg
          viewBox="0 0 2400 60"
          preserveAspectRatio="none"
          className="absolute -top-[59px] left-0 h-[60px] w-[200%] animate-[slide-half_5s_linear_infinite]"
          aria-hidden
        >
          <path d={WAVE} transform="translate(0 16)" fill="#46a843" />
        </svg>
        <div className="h-full bg-leaf-500" />
      </div>
      <div className="relative grid h-full place-items-center">
        <div className="flex flex-col items-center">
          <MakkaLogo className="pre-logo size-36 drop-shadow-2xl md:size-44" />
          <div className="pre-copy mt-6 text-center">
            <p className="text-xl font-extrabold text-cream">بنعصرلك…</p>
            <p className="pre-num mt-1 text-4xl font-extrabold text-lime tabular-nums" aria-hidden>
              ٠٪
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
