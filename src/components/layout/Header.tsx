import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../../data/brand'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { lockScroll, scrollToTarget } from '../../lib/lenis'
import { cn, toArabicDigits } from '../../lib/utils'
import { ICONS } from '../art/icons'
import { MakkaLogo } from '../brand/MakkaLogo'
import { Wordmark } from '../brand/Wordmark'
import { btn } from '../ui/button'
import { PhoneGlyph, WhatsAppGlyph } from '../ui/glyphs'
import { sticker } from '../ui/sticker'

const LINKS = [
  { href: '#signatures', label: 'الأساطير' },
  { href: '#menu', label: 'المنيو' },
  { href: '#bottles', label: 'مكة على طول' },
  { href: '#branches', label: 'الفروع' },
]

// the open mobile menu gets the footer's bobbing fruit in its empty corners
const PANEL_FRUITS = [
  { Icon: ICONS.mango, cls: 'top-[13%] left-[8%] w-20', bob: '5.2s' },
  { Icon: ICONS.kiwi, cls: 'bottom-[17%] left-[5%] w-20', bob: '4.8s' },
  { Icon: ICONS.strawberry, cls: 'bottom-[4%] left-[32%] w-16', bob: '6.1s' },
  { Icon: ICONS.mint, cls: 'bottom-[7%] right-[12%] w-10', bob: '5.6s' },
]

export function Header() {
  const root = useRef<HTMLElement>(null)
  const burger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const { contextSafe } = useGSAP(
    () => {
      const html = document.documentElement
      html.dataset.nav = 'shown'
      const bar = root.current!.querySelector('.nav-bar')
      const mm = gsap.matchMedia()

      /* Phones + tablets: the bar never hides. Auto-hiding it there made it "disappear": after a jump from the
         menu, at the end of a momentum fling, or anywhere you stopped after scrolling down.
         Wide screens: hide on scroll down / show on scroll up, with hysteresis (80px down to hide, 16px up to
         show) so small wobbles of the wheel or trackpad don't make it flicker. */
      mm.add('(min-width: 64rem)', () => {
        const hide = gsap.to(bar, { yPercent: -160, duration: 0.45, ease: 'power3.inOut', paused: true })
        let hidden = false
        let dir = 0
        let turn = 0 // scroll position where the direction last changed
        const setHidden = (next: boolean) => {
          if (next === hidden) return
          hidden = next
          if (next) hide.play()
          else hide.reverse()
          html.dataset.nav = next ? 'hidden' : 'shown' // sticky UI (menu bar) follows via --nav-offset
        }
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const y = self.scroll()
            if (y < 160) return setHidden(false)
            if (self.direction !== dir) [dir, turn] = [self.direction, y]
            if (dir === 1 && y - turn > 80) setHidden(true)
            else if (dir === -1 && turn - y > 16) setHidden(false)
          },
          onRefresh: (self) => self.scroll() < 160 && setHidden(false),
        })
        return () => {
          hide.revert()
          html.dataset.nav = 'shown'
        }
      })
      return () => {
        mm.revert()
        delete html.dataset.nav
      }
    },
    { scope: root },
  )

  const toggle = contextSafe((next: boolean) => {
    setOpen(next)
    lockScroll(next)
    const panel = '.mobile-panel'
    // the panel grows out of the burger button itself (left side in RTL)
    const r = burger.current?.getBoundingClientRect()
    const at = r ? `${Math.round(r.left + r.width / 2)}px ${Math.round(r.top + r.height / 2)}px` : '10% 5%'
    if (next) {
      gsap.fromTo(panel, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 0.8, ease: 'expo.inOut' })
      gsap.fromTo('.mobile-link', { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 0.8, delay: 0.25, ease: 'expo.out', overwrite: true })
    } else {
      gsap.to(panel, { clipPath: `circle(0% at ${at})`, duration: 0.55, ease: 'expo.inOut' })
    }
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && toggle(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, toggle])

  const go = (href: string) => {
    if (open) toggle(false)
    scrollToTarget(href)
  }

  return (
    // pointer-events-none: the header box stays put when the bar slides away — it must never swallow taps
    // meant for the sticky menu search underneath it (that was the "search doesn't work on mobile" bug)
    <header ref={root} className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      {/* solid (no backdrop-filter: re-blurring the animated hero every frame was a big mobile cost) */}
      <nav
        aria-label="القائمة الرئيسية"
        className="nav-bar pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full bg-forest-950 p-2 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            go('#top')
          }}
          className="flex items-center gap-2.5 pe-2 md:gap-3 md:pe-4"
          aria-label="عصير مكة — لفوق"
        >
          <MakkaLogo className="size-10 shrink-0 min-[360px]:size-11 md:size-12" />
          <Wordmark className="text-[1.1rem] min-[360px]:text-[1.3rem] min-[400px]:text-[1.45rem] md:text-[1.7rem]" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
                className="rounded-full px-4 py-2 font-bold text-cream/80 transition-colors hover:bg-white/10 hover:text-cream"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* desktop only (btn() sets display, so the breakpoint lives on a wrapper) */}
          <span className="hidden lg:block">
            <a href={BRAND.whatsapp.link} target="_blank" rel="noreferrer" aria-label="اطلب على واتساب" className={btn('whatsapp', 'md', 'mb-1 size-11 !px-0')}>
              <WhatsAppGlyph className="size-6" />
            </a>
          </span>
          <a
            href={`tel:${BRAND.hotline}`}
            // a size smaller on phones so the wordmark fits next to it
            className={btn('lime', 'md', 'mb-1 max-sm:gap-1.5 max-sm:border-2 max-sm:px-3 max-sm:py-1.5 max-sm:text-sm')}
            aria-label={`اتصل ${BRAND.hotline}`}
          >
            <PhoneGlyph />
            <span dir="ltr">{BRAND.hotline}</span>
          </a>
          <button
            ref={burger}
            type="button"
            aria-label={open ? 'اقفل القائمة' : 'افتح القائمة'}
            aria-expanded={open}
            onClick={() => toggle(!open)}
            className="relative z-10 grid size-11 place-items-center rounded-full border-2 border-cream/30 bg-white/10 lg:hidden"
          >
            <span className={cn('absolute h-0.5 w-5 rounded bg-cream transition-transform duration-300', open ? 'rotate-45' : '-translate-y-1.5')} />
            <span className={cn('absolute h-0.5 w-5 rounded bg-cream transition-transform duration-300', open ? '-rotate-45' : 'translate-y-1.5')} />
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <div
        className="mobile-panel pointer-events-auto fixed inset-0 -z-10 flex flex-col justify-center overflow-hidden bg-lime px-8 lg:hidden"
        style={{ clipPath: 'circle(0% at 10% 5%)' }}
        aria-hidden={!open}
        inert={!open}
      >
        <div aria-hidden className="doodles absolute inset-0 opacity-[0.12] invert" />
        {PANEL_FRUITS.map(({ Icon, cls, bob }, n) => (
          <span key={n} aria-hidden className={`absolute ${cls}`}>
            <span className="block animate-[bob_var(--bob)_ease-in-out_infinite]" style={{ ['--bob' as string]: bob }}>
              <Icon className="h-auto w-full drop-shadow-[0_8px_10px_rgba(4,32,15,0.25)]" />
            </span>
          </span>
        ))}
        <ul className="relative space-y-1">
          {LINKS.map((l, n) => (
            <li key={l.href} className="split-word-mask overflow-hidden">
              <a
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
                className="mobile-link flex items-baseline gap-3 text-[clamp(2.6rem,13vw,3.75rem)] leading-[1.2] font-extrabold text-forest-900"
              >
                <span className="text-base font-bold text-forest-900/50 tabular-nums">٠{toArabicDigits(n + 1)}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={sticker('cream', 'dark', 'relative mt-10 text-3xl font-extrabold')}>{BRAND.slogans.cup}</p>
        <div className="relative mt-7 flex flex-wrap gap-3 pb-1">
          <a href={`tel:${BRAND.hotline}`} className={btn('green', 'lg')}>
            <PhoneGlyph />
            اطلب <span dir="ltr">{BRAND.hotline}</span>
          </a>
          <a href={BRAND.whatsapp.link} target="_blank" rel="noreferrer" className={btn('whatsapp', 'lg')}>
            <WhatsAppGlyph />
            واتساب
          </a>
        </div>
      </div>
    </header>
  )
}
