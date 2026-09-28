import { MENU, type Price } from './menu'

/**
 * Signature drinks showcased in the horizontal "أساطير مكة" gallery.
 * Names + prices come from the real menu. Layer colours and taglines are
 * placeholder art direction — the real recipes must come from the client
 * (docs/06-assets-needed.md).
 */
export interface Signature {
  name: string
  tagline: string
  /** Liquid layers, bottom → top */
  layers: string[]
  bg: string
  ink: string
  prices: Price[]
}

const priceOf = (name: string): Price[] =>
  MENU.flatMap((c) => c.items).find((it) => it.name === name)?.prices ?? []

const s = (name: string, tagline: string, layers: string[], bg: string, ink = '#0b3d24'): Signature => ({
  name,
  tagline,
  layers,
  bg,
  ink,
  prices: priceOf(name),
})

export const SIGNATURES: Signature[] = [
  s('العتيل', 'اسم على مسمّى', ['#e8434f', '#f9a825', '#fff1d0'], '#ffd23f'),
  s('الإمبراطور', 'كوباية تليق بالملوك', ['#7b3fa0', '#e8434f', '#ffd6e0'], '#ff8fab'),
  s('الساحر', 'هيسحرك من أول شفطة', ['#2e7d32', '#9ccc65', '#f1f8e9'], '#c6f36b'),
  s('أبو السلاطين', 'للسلاطين وبس', ['#f57c00', '#ffb74d', '#fff3e0'], '#ffb347'),
  s('تايجر كينج', 'قوة النمر في كوباية', ['#ff6f00', '#3e2723', '#ffcc80'], '#ff9f43'),
  s('الكينج', 'الملك رجع', ['#5d4037', '#d7a86e', '#fff8e1'], '#f4d58d'),
  s('ديناميت', 'انفجار طعم', ['#c62828', '#ff7043', '#ffe082'], '#ff6b6b', '#fff8e7'),
  s('شيكو', 'شيك على الآخر', ['#4e342e', '#a1887f', '#efebe9'], '#d7b899'),
  s('لوليتا', 'طعم زمان رجع تاني', ['#ff8a00', '#ffb74d', '#ffe0b2'], '#8fd16f'),
]
