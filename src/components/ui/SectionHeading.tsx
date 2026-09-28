import { useRef } from 'react'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '../../lib/gsap'
import { cn } from '../../lib/utils'
import { sticker, type StickerFill } from './sticker'

interface Props {
  eyebrow: string
  title: string
  /** part of `title` set in the Makka sticker type */
  accent?: string
  accentFill?: StickerFill
  lead?: string
  tone?: 'light' | 'dark'
  align?: 'start' | 'center'
  className?: string
}

/** Eyebrow + big title whose words rise out of a mask when scrolled into view. */
export function SectionHeading({ eyebrow, title, accent, accentFill = 'lime', lead, tone = 'light', align = 'start', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // wordsClass → masks get `.split-word-mask`, which index.css pads so Arabic dots aren't clipped
      const split = SplitText.create(ref.current!.querySelector('h2'), { type: 'words', mask: 'words', wordsClass: 'split-word' })
      gsap.from(split.words, {
        yPercent: 140,
        rotation: 3,
        stagger: 0.07,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      })
      gsap.from(ref.current!.querySelectorAll('[data-fade]'), {
        autoAlpha: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.9,
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      })
      return () => split.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={cn(align === 'center' && 'mx-auto text-center', 'max-w-4xl', className)}>
      <p
        data-fade
        className={cn(
          'mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold',
          tone === 'light' ? 'bg-lime/15 text-lime' : 'bg-forest-900/10 text-forest-800',
        )}
      >
        <span className="size-2 rounded-full bg-current" />
        {eyebrow}
      </p>
      <h2
        className={cn(
          // ≥1.25: at 1.0 the dots under «ي» on one line sank into the tall letters of the next (اللي → اللى)
          'text-[clamp(2.6rem,7vw,6rem)] leading-[1.25] font-extrabold text-balance',
          tone === 'light' ? 'text-cream' : 'text-forest-900',
        )}
      >
        {accent && title.includes(accent) ? (
          <>
            {title.slice(0, title.indexOf(accent))}
            {/* dark sections: cream rim (the footer look); light sections: forest rim */}
            <span className={sticker(accentFill, tone === 'light' ? 'light' : 'dark')}>{accent}</span>
            {title.slice(title.indexOf(accent) + accent.length)}
          </>
        ) : (
          title
        )}
      </h2>
      {lead && (
        <p data-fade className={cn('mt-5 max-w-2xl text-lg md:text-xl', align === 'center' && 'mx-auto', tone === 'light' ? 'text-cream/75' : 'text-forest-900/75')}>
          {lead}
        </p>
      )}
    </div>
  )
}
