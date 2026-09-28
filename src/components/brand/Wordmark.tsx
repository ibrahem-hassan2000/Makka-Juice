import { cn } from '../../lib/utils'
import { ICONS } from '../art/icons'
import { sticker } from '../ui/sticker'

/**
 * «عصير مكة» as a sticker with fruit perched on it — the footer wordmark, shrunk for the nav.
 * Everything is sized in em, so the font size of `className` scales the whole thing.
 * Small sizes get a thicker rim/edge (0.07em of 24px would be a hairline).
 */
export function Wordmark({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span className={cn('group/wm relative inline-block leading-none whitespace-nowrap', className)}>
      <span className={sticker('lime', tone, '[--st-drop:0.1em] [--st-line:0.12em] font-extrabold')}>عصير مكة</span>
      <span
        aria-hidden
        className="absolute -top-[0.5em] -right-[0.32em] w-[0.72em] rotate-[18deg] transition-[rotate,translate] duration-500 ease-(--ease-squish) group-hover/wm:-translate-y-[0.18em] group-hover/wm:rotate-[-8deg]"
      >
        <span className="block animate-[bob_4.6s_ease-in-out_infinite]">
          <ICONS.strawberry className="h-auto w-full" />
        </span>
      </span>
      <span
        aria-hidden
        className="absolute -bottom-[0.28em] -left-[0.3em] w-[0.56em] rotate-[-20deg] transition-[rotate,translate] delay-75 duration-500 ease-(--ease-squish) group-hover/wm:-translate-y-[0.22em] group-hover/wm:rotate-[14deg]"
      >
        <span className="block animate-[bob_5.4s_ease-in-out_infinite] [animation-delay:-2s]">
          <ICONS.orange className="h-auto w-full" />
        </span>
      </span>
    </span>
  )
}
