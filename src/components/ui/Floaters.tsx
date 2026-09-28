import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/gsap'
import { cn } from '../../lib/utils'
import { ICONS, type IconKey } from '../art/icons'

export interface Floater {
  icon: IconKey
  /** position + size (Tailwind). No translate-* here: GSAP owns this element's transform. */
  cls: string
  /** how far it drifts over the scroll (1 = about its own height each way) */
  depth?: number
}

/**
 * Fruit drifting past as you scroll (the «عطشان؟ كلّمنا على» look), for the empty corners of a section.
 * Drops into its parent (which must be `relative`) behind the content; the parent is the scroll trigger.
 * Each fruit is its own layer and only its transform changes → no repaints while scrolling.
 */
export function Floaters({ items, className, clip = true }: { items: Floater[]; className?: string; clip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const trigger = ref.current!.parentElement
      gsap.utils.toArray<HTMLElement>('.floater', ref.current).forEach((el, n) => {
        const d = Number(el.dataset.depth)
        const spin = n % 2 ? -1 : 1
        gsap.fromTo(
          el,
          { yPercent: 60 * d, rotation: -24 * spin },
          {
            yPercent: -60 * d,
            rotation: 30 * spin,
            ease: 'none',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0', clip && 'overflow-hidden', className)}>
      {items.map(({ icon, cls, depth = 1 }, n) => {
        const Icon = ICONS[icon]
        return (
          <div key={n} data-depth={depth} className={cn('floater absolute will-change-transform', cls)}>
            <Icon className="h-auto w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.22)]" />
          </div>
        )
      })}
    </div>
  )
}
