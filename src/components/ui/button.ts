import { cn } from '../../lib/utils'

/**
 * Makka "sticker" buttons — the look of their hotline badge and printed menu: chunky rounded shape, cream
 * outline, a hard darker edge underneath. Hover lifts it, press squashes it flat (pure CSS, no JS).
 */
type Tone = 'green' | 'lime' | 'cream' | 'berry' | 'talabat' | 'whatsapp' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const TONES: Record<Tone, string> = {
  green: 'bg-leaf-500 text-cream border-cream [--edge:var(--color-forest-950)]',
  lime: 'bg-lime text-forest-900 border-forest-900 [--edge:var(--color-forest-900)]',
  cream: 'bg-cream text-forest-900 border-forest-900 [--edge:var(--color-forest-900)]',
  berry: 'bg-berry text-cream border-cream [--edge:#7d1621]',
  talabat: 'bg-[#ff5a00] text-white border-cream [--edge:#8f3200]',
  whatsapp: 'bg-[#25d366] text-forest-950 border-cream [--edge:#0b6b33]',
  dark: 'bg-forest-900 text-cream border-lime [--edge:var(--color-forest-950)]',
}

const SIZES: Record<Size, string> = {
  sm: 'gap-1.5 border-2 px-3.5 py-1.5 text-sm [--lift:3px]',
  md: 'gap-2 border-[3px] px-5 py-2.5 text-base [--lift:4px]',
  lg: 'gap-2.5 border-[3px] px-7 py-3.5 text-lg [--lift:5px]',
}

export const btn = (tone: Tone = 'green', size: Size = 'md', className?: string) =>
  cn(
    'relative inline-flex items-center justify-center rounded-full font-extrabold whitespace-nowrap select-none',
    'shadow-[0_var(--lift)_0_var(--edge)] transition-[translate,box-shadow] duration-150 ease-out',
    'hover:-translate-y-0.5 hover:shadow-[0_calc(var(--lift)_+_2px)_0_var(--edge)]',
    'active:translate-y-(--lift) active:shadow-[0_0_0_var(--edge)]',
    'focus-visible:outline-offset-4',
    TONES[tone],
    SIZES[size],
    className,
  )
