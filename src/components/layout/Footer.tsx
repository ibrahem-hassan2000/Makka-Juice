import { useRef } from 'react'
import { BRANCH_COUNT, BRAND, CITIES } from '../../data/brand'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '../../lib/gsap'
import { scrollToTarget } from '../../lib/lenis'
import { toArabicDigits, wavePath } from '../../lib/utils'
import { ICONS } from '../art/icons'
import { MakkaLogo } from '../brand/MakkaLogo'
import { btn } from '../ui/button'
import { sticker } from '../ui/sticker'
import { ArrowUpGlyph, BagGlyph, FacebookGlyph, InstagramGlyph, MenuGlyph, PhoneGlyph, PinGlyph, WhatsAppGlyph } from '../ui/glyphs'

const WAVE = wavePath(2400, 70, 16, 240)

const OFFICIAL = [
  { href: BRAND.links.menu, label: 'المنيو الرسمي', Icon: MenuGlyph },
  { href: BRAND.links.backToSchool, label: 'منيو Back to School', Icon: MenuGlyph },
  { href: BRAND.links.branches, label: 'صفحة الفروع', Icon: PinGlyph },
]

const LINKS = [
  { href: '#signatures', label: 'أساطير مكة', Icon: ICONS.signature },
  { href: '#menu', label: 'المنيو كامل', Icon: ICONS.mango },
  { href: '#bottles', label: 'مكة على طول', Icon: ICONS.milk },
  { href: '#branches', label: 'الفروع', Icon: ICONS.strawberry },
]

// fruits orbiting the wordmark — outer div pops in (GSAP), inner span bobs (CSS), so they never fight
const FLOATERS = [
  { Icon: ICONS.strawberry, cls: 'top-[2%] right-[4%] w-[clamp(44px,8vw,110px)]', bob: '5s', delay: '0s' },
  { Icon: ICONS.kiwi, cls: 'bottom-[6%] right-[26%] w-[clamp(36px,6vw,84px)]', bob: '6.5s', delay: '-2s' },
  { Icon: ICONS.mango, cls: 'top-[0%] left-[30%] w-[clamp(40px,7vw,100px)]', bob: '5.8s', delay: '-1s' },
  { Icon: ICONS.orange, cls: 'bottom-[4%] left-[5%] w-[clamp(44px,7.5vw,104px)]', bob: '7s', delay: '-3s' },
  { Icon: ICONS.mint, cls: 'top-[40%] left-[50%] w-[clamp(30px,4vw,60px)]', bob: '4.6s', delay: '-1.5s' },
]

export function Footer() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const split = SplitText.create('.footer-word', { type: 'words', mask: 'words', wordsClass: 'split-word' })
      const mark = { trigger: '.footer-mark', start: 'top 92%', once: true }
      gsap.from(split.words, { yPercent: 140, rotation: 4, stagger: 0.14, duration: 1.3, ease: 'expo.out', scrollTrigger: mark })
      gsap.from('.footer-fruit', { scale: 0, rotation: -70, stagger: 0.09, duration: 1, ease: 'back.out(2)', delay: 0.25, scrollTrigger: mark })
      gsap.from('.footer-col', {
        y: 36,
        autoAlpha: 0,
        stagger: 0.09,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
      })
      return () => split.revert()
    },
    { scope: root },
  )

  const heading = 'mb-5 flex items-center gap-2 text-sm font-extrabold tracking-wide text-lime'
  const link = 'group flex items-center gap-3 py-1.5 text-lg font-bold text-cream/80 transition-colors hover:text-cream'

  return (
    <footer ref={root} className="relative overflow-x-clip bg-forest-950 text-cream">
      {/* liquid edge poured over the section above — clipped wrapper: the 200%-wide wave must never widen the page */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[46px] h-[48px] overflow-hidden md:-top-[62px] md:h-16">
        <svg viewBox="0 0 2400 70" preserveAspectRatio="none" className="absolute inset-y-0 left-0 h-full w-[200%] animate-[slide-half_14s_linear_infinite]">
          <path d={WAVE} transform="translate(0 16)" fill="#04200f" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pt-16 md:px-10 md:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="footer-col sm:col-span-2 lg:col-span-5">
            <MakkaLogo className="size-24 transition-transform duration-500 ease-(--ease-squish) hover:rotate-[-12deg] md:size-28" />
            <p className="mt-6 text-4xl leading-tight font-extrabold md:text-5xl">{BRAND.slogans.cup}</p>
            <p className="mt-3 max-w-md text-lg text-cream/65">
              {BRAND.slogans.origin} لكل مصر — {toArabicDigits(BRANCH_COUNT)} فرع في {toArabicDigits(CITIES.length)} محافظات،
              ورقم واحد يوصلك بيهم كلهم.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 pb-2">
              <a href={`tel:${BRAND.hotline}`} className={btn('green', 'lg')}>
                <PhoneGlyph />
                <span dir="ltr">{BRAND.hotline}</span>
              </a>
              <a href={BRAND.whatsapp.link} target="_blank" rel="noreferrer" className={btn('whatsapp', 'lg')}>
                <WhatsAppGlyph />
                واتساب
              </a>
              <a href={BRAND.links.talabat} target="_blank" rel="noreferrer" className={btn('talabat', 'lg')}>
                <BagGlyph />
                طلبات
              </a>
            </div>
            {/* Makka's own pages (the links their Facebook auto-reply sends) */}
            <ul className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
              {OFFICIAL.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-cream/15 px-3 py-1.5 text-cream/80 transition-colors hover:border-lime/60 hover:text-cream"
                  >
                    <Icon className="size-4 text-lime" />
                    {label}
                    <span aria-hidden className="text-cream/40">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="روابط" className="footer-col lg:col-span-2 lg:col-start-7">
            <p className={heading}>اكتشف</p>
            <ul>
              {LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToTarget(href)
                    }}
                    className={link}
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-white/95 transition-transform duration-300 ease-(--ease-squish) group-hover:-rotate-12 group-hover:scale-110">
                      <Icon className="size-6" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col lg:col-span-2">
            <p className={heading}>فروعنا</p>
            <ul>
              {CITIES.map((c) => (
                <li key={c.id}>
                  <a
                    href="#branches"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToTarget('#branches')
                    }}
                    className={link}
                  >
                    {c.name}
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-lime px-1.5 text-xs font-extrabold text-forest-900">
                      {toArabicDigits(c.branches.length)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col sm:col-span-2 lg:col-span-3">
            <p className={heading}>تابعنا</p>
            <ul className="space-y-3">
              <li>
                <a href={BRAND.whatsapp.link} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                  <span className={btn('whatsapp', 'md', 'size-12 !px-0')}>
                    <WhatsAppGlyph />
                  </span>
                  <span>
                    <span className="block text-lg font-extrabold">واتساب — للطلبات</span>
                    <span className="block text-sm text-cream/60" dir="ltr">
                      {BRAND.whatsapp.number.replace(/(d{4})(d{3})(d{4})/, '$1 $2 $3')}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a href={BRAND.links.facebook} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                  <span className={btn('dark', 'md', 'size-12 !px-0')}>
                    <FacebookGlyph />
                  </span>
                  <span>
                    <span className="block text-lg font-extrabold">فيسبوك</span>
                    <span className="block text-sm text-cream/60">٥٤٨ ألف متابع</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={BRAND.links.instagram} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                  <span className={btn('dark', 'md', 'size-12 !px-0')}>
                    <InstagramGlyph />
                  </span>
                  <span>
                    <span className="block text-lg font-extrabold">إنستجرام</span>
                    <span className="block text-sm text-cream/60" dir="ltr">
                      @makkajuiceeg
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* the wordmark, as a Makka sticker: lime fill, cream outline, hard dark edge */}
        <div className="footer-mark relative mt-20 md:mt-24" aria-hidden>
          {FLOATERS.map(({ Icon, cls, bob, delay }, n) => (
            <div key={n} className={`footer-fruit absolute z-10 ${cls}`}>
              <span className="block animate-[bob_var(--bob)_ease-in-out_infinite]" style={{ ['--bob' as string]: bob, animationDelay: delay }}>
                <Icon className="h-auto w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]" />
              </span>
            </div>
          ))}
          <p className={sticker('lime', 'light', 'footer-word relative text-center text-[clamp(3.6rem,19vw,18rem)] leading-[1.05] font-extrabold select-none')}>
            عصير مكة
          </p>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 py-7 text-sm text-cream/55 md:flex-row">
          <p className="text-center md:text-start">
            © {toArabicDigits(new Date().getFullYear())} عصير مكة — Makka Juice · اتعمل بحب في اسكندرية
          </p>
          <div className="flex items-center gap-3">
            {/* Remove once the brand approves the site (docs/07-roadmap.md) */}
            <span className="rounded-full bg-white/5 px-3 py-1">نسخة تجريبية مقترحة — غير رسمية</span>
            <button type="button" onClick={() => scrollToTarget(0, 2.2)} className={btn('cream', 'md', 'mb-1')} aria-label="ارجع لفوق">
              <ArrowUpGlyph />
              لفوق
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
