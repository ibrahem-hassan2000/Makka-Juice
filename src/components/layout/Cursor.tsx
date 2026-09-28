import { useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../../hooks/useMedia'
import { gsap, useGSAP } from '../../lib/gsap'

/** Juice-drop cursor follower (desktop only). Grows over anything clickable. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  useGSAP(
    () => {
      if (!enabled) return
      const el = dot.current!
      const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' })
      const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' })
      let shown = false
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        if (!shown) {
          // first move: appear where the pointer is, not fly in from the corner
          shown = true
          gsap.set(el, { x: e.clientX, y: e.clientY })
          gsap.to(el, { autoAlpha: 1, duration: 0.25 })
        }
        x(e.clientX)
        y(e.clientY)
      }
      const over = (e: PointerEvent) => {
        const hot = (e.target as HTMLElement).closest('a, button, [role="button"], input, [role="tab"]')
        gsap.to(el, { scale: hot ? 2.6 : 1, duration: 0.3, ease: 'power3', overwrite: 'auto' })
      }
      const leave = (e: PointerEvent) => {
        if (e.relatedTarget) return
        shown = false
        gsap.to(el, { autoAlpha: 0, duration: 0.2 })
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerover', over)
      document.documentElement.addEventListener('pointerleave', leave)
      return () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerover', over)
        document.documentElement.removeEventListener('pointerleave', leave)
      }
    },
    { dependencies: [enabled] },
  )

  if (!enabled) return null
  return (
    <div
      ref={dot}
      aria-hidden
      // no mix-blend-mode: a blended fixed layer forces the whole page to re-composite on every scroll frame
      className="pointer-events-none fixed top-0 left-0 z-[90] -mt-2 -ml-2 size-4 rounded-full border-2 border-forest-900 bg-lime opacity-0 will-change-transform"
    />
  )
}
