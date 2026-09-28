import type { Price } from '../../data/menu'
import { cn, toArabicDigits } from '../../lib/utils'

/** Same colour system as the printed menu: orange = small, red = large, white = bottle. */
export const PILL_TONES = ['bg-mango text-forest-950', 'bg-berry text-cream', 'bg-white text-berry ring-1 ring-berry/30']

/** "زجاجة ٩٠٠" → "زجاجة" — the 900 ml note lives in the menu footnote */
const shortSize = (s: string) => s.replace(/\s*٩٠٠$/, '')

interface Props {
  prices: Price[]
  sizes: string[]
  /** `card` = on a coloured signature card (labels follow the card's ink colour) */
  surface?: 'menu' | 'card'
  className?: string
}

/** Price pills with their size written directly underneath — every column lines up exactly. */
export function PriceTags({ prices, sizes, surface = 'menu', className }: Props) {
  return (
    <div className={cn('flex shrink-0 gap-1.5 md:gap-2', className)}>
      {prices.map((p, n) => (
        <div key={n} className={cn('flex w-11 flex-col items-center gap-1 md:w-14', p == null && 'opacity-35')}>
          <span
            className={cn(
              'grid h-8 w-full place-items-center rounded-full text-sm font-extrabold tabular-nums md:h-9 md:text-base',
              p == null ? (surface === 'card' ? 'bg-black/10' : 'bg-forest-900/10 text-forest-900') : PILL_TONES[n % PILL_TONES.length],
            )}
            aria-hidden
          >
            {p == null ? '—' : toArabicDigits(p)}
          </span>
          <span className={cn('text-[11px] leading-none font-bold', surface === 'card' ? 'opacity-70' : 'text-forest-900/60')} aria-hidden>
            {shortSize(sizes[n])}
          </span>
          <span className="sr-only">{p == null ? `${sizes[n]} غير متاح` : `${sizes[n]} ${p} جنيه`}</span>
        </div>
      ))}
    </div>
  )
}
