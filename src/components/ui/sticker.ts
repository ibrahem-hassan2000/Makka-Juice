import { cn } from '../../lib/utils'

/**
 * Makka sticker type (the footer wordmark): a juicy fill, an outline and a hard edge underneath.
 * `light` outline = cream rim, for dark sections. `dark` outline = forest rim + edge, for cream/colour sections.
 * The utility itself (`sticker-text`) is in index.css.
 */
export type StickerFill = 'lime' | 'cream' | 'mango' | 'berry' | 'leaf' | 'straw' | 'cocoa'
type Outline = 'light' | 'dark'

const FILL: Record<StickerFill, string> = {
  lime: '[--st-fill:var(--color-lime)]',
  cream: '[--st-fill:var(--color-cream)]',
  mango: '[--st-fill:var(--color-mango)]',
  berry: '[--st-fill:var(--color-berry)]',
  leaf: '[--st-fill:var(--color-leaf-400)]',
  straw: '[--st-fill:var(--color-straw)]',
  cocoa: '[--st-fill:#8a5a3c]',
}

const OUTLINE: Record<Outline, string> = {
  light: '[--st-stroke:var(--color-cream)] [--st-edge:var(--color-forest-900)]',
  dark: '[--st-stroke:var(--color-forest-900)] [--st-edge:var(--color-forest-900)]',
}

export const sticker = (fill: StickerFill = 'lime', outline: Outline = 'light', className?: string) =>
  cn('sticker-text', FILL[fill], OUTLINE[outline], className)
