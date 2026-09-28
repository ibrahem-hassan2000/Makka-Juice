import type { CSSProperties } from 'react'
import { cn } from '../../lib/utils'

/**
 * Text filled with juice: fill layer (colour/gradient + fruit print, cream rim) over a dark edge layer.
 * Two copies of the text because a text-shadow would paint over a background-clip:text fill.
 * `data-juicy-text` marks both copies, for code that updates the text live (the story counters).
 */
export function JuicyText({ text, juice, tile, className }: { text: string; juice: string; tile: string; className?: string }) {
  return (
    <span className={cn('juicy relative inline-block', className)}>
      <span aria-hidden className="juicy-edge absolute inset-0" data-juicy-text>
        {text}
      </span>
      <span className="juicy-fill relative" style={{ '--juice': juice, '--tile': tile } as CSSProperties} data-juicy-text>
        {text}
      </span>
    </span>
  )
}
