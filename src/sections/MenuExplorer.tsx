import { AnimatePresence, LazyMotion, m } from 'motion/react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { ICONS, type IconKey } from '../components/art/icons'
import { btn } from '../components/ui/button'
import { Floaters } from '../components/ui/Floaters'
import { ArrowUpGlyph } from '../components/ui/glyphs'
import { SectionHeading } from '../components/ui/SectionHeading'
import { PriceTags } from '../components/ui/PricePills'
import { sticker, type StickerFill } from '../components/ui/sticker'
import { BRAND } from '../data/brand'
import { MENU, MENU_ITEM_COUNT, type MenuCategory } from '../data/menu'
import { categoryIcon, iconsFor } from '../data/menuIcons'
import { headerSpace, scrollToTarget } from '../lib/lenis'
import { cn, normalizeAr as normalize, toArabicDigits } from '../lib/utils'

const loadFeatures = () => import('../lib/motionFeatures').then((r) => r.default)

/** each category wears its own colour: the active tab and the sticker title of the list */
const TONE: Record<MenuCategory['tone'], { pill: string; text: string; fill: StickerFill }> = {
  mango: { pill: 'bg-mango', text: 'text-forest-950', fill: 'mango' },
  berry: { pill: 'bg-berry', text: 'text-cream', fill: 'berry' },
  lime: { pill: 'bg-lime', text: 'text-forest-900', fill: 'lime' },
  cream: { pill: 'bg-leaf-500', text: 'text-cream', fill: 'cream' },
  cocoa: { pill: 'bg-cocoa', text: 'text-cream', fill: 'cocoa' },
}

/** The fruits in the drink, overlapping like stickers (3rd one only on wide screens). */
function FruitStack({ icons }: { icons: IconKey[] }) {
  return (
    <span className="flex shrink-0 -space-x-3" aria-hidden>
      {icons.map((key, i) => {
        const Icon = ICONS[key]
        return (
          <span
            key={key}
            className={cn(
              'relative grid size-8 place-items-center rounded-full bg-white shadow-[0_2px_6px_-2px_rgba(11,74,46,0.35)] ring-2 ring-cream min-[400px]:size-9 md:size-10',
              i === 2 && 'hidden lg:grid',
            )}
            style={{ zIndex: 3 - i }}
          >
            <Icon className="size-5.5 min-[400px]:size-6 md:size-7" />
          </span>
        )
      })}
    </span>
  )
}

/** «سفنجة = أناناس» / «كاكاو (سوبيا خروب)»: the part the menu prints after "=" or in brackets is what's in it →
 *  shown as a small ingredients line under the name (search still matches the full name). */
function ItemName({ name }: { name: string }) {
  const m = name.match(/^(.+?)\s*=\s*(.+)$/) ?? name.match(/^(.+?)\s*\((.+)\)$/)
  return (
    <span className="min-w-0 text-base leading-snug font-bold [overflow-wrap:anywhere] md:text-xl">
      {m ? m[1] : name}
      {m && <span className="mt-0.5 block text-sm leading-snug font-semibold text-forest-900/55 md:text-base">{m[2]}</span>}
    </span>
  )
}

const list = {
  show: { transition: { staggerChildren: 0.012 } },
}
const row = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

export function MenuExplorer() {
  const [active, setActive] = useState(MENU[0].id)
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const q = normalize(deferred)
  const controls = useRef<HTMLDivElement>(null)
  const results = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: false })

  /** If the reader is down inside a long list, bring the top of the (new, maybe shorter) list back under the bar —
   *  otherwise the content shrinks under them and they land in the next section. */
  const keepListInView = () => {
    if (!results.current || !controls.current) return
    const top = results.current.getBoundingClientRect().top + window.scrollY - controls.current.offsetHeight - headerSpace() - 8
    if (window.scrollY > top) scrollToTarget(top, 0.8)
  }

  /** the tab strip scrolls sideways: the fades + arrows only show on a side that has more tabs */
  const syncStrip = () => {
    const el = strip.current
    if (!el) return
    const x = Math.abs(el.scrollLeft) // RTL: 0 → negative
    const max = el.scrollWidth - el.clientWidth
    const atStart = x < 4
    const atEnd = x > max - 4
    setEdges((e) => (e.atStart === atStart && e.atEnd === atEnd ? e : { atStart, atEnd }))
  }
  useEffect(() => {
    syncStrip()
    const ro = new ResizeObserver(syncStrip)
    ro.observe(strip.current!)
    return () => ro.disconnect()
  }, [])

  const scrollStrip = (dir: 1 | -1) => strip.current?.scrollBy({ left: -dir * strip.current.clientWidth * 0.7, behavior: 'smooth' })

  const pick = (id: string, tab: HTMLElement) => {
    setQuery('')
    setActive(id)
    // centre the tab inside its own strip only (scrollIntoView could nudge the whole page sideways)
    const t = tab.getBoundingClientRect()
    const s = strip.current!.getBoundingClientRect()
    strip.current!.scrollBy({ left: t.left + t.width / 2 - (s.left + s.width / 2), behavior: 'smooth' })
    keepListInView()
  }

  const groups = useMemo(() => {
    if (!q) return MENU.filter((c) => c.id === active)
    return MENU.map((c) => ({ ...c, items: c.items.filter((it) => normalize(it.name).includes(q)) })).filter(
      (c) => c.items.length,
    )
  }, [active, q])

  const hits = groups.reduce((n, c) => n + c.items.length, 0)
  const fade = 'pointer-events-none absolute inset-y-0 w-14 transition-opacity duration-300 md:w-24'

  return (
    <section id="menu" className="relative overflow-x-clip bg-cream px-4 py-28 text-forest-900 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="relative">
          <Floaters
            clip={false}
            items={[
              { icon: 'mango', cls: '-top-8 left-[2%] w-[clamp(56px,8vw,130px)] md:top-0 md:left-[6%]', depth: 1.4 },
              { icon: 'strawberry', cls: 'top-[42%] left-[22%] hidden w-[clamp(44px,5vw,90px)] md:block', depth: 1 },
              { icon: 'kiwi', cls: 'bottom-0 left-[6%] hidden w-[clamp(40px,4.5vw,80px)] lg:block', depth: 1.8 },
            ]}
          />
          <SectionHeading
            tone="dark"
            eyebrow="المنيو"
            title="كل اللي نفسك فيه… في مكان واحد"
            accent="في مكان واحد"
            accentFill="mango"
            className="relative"
            lead={`${toArabicDigits(MENU_ITEM_COUNT)} صنف من فريشات وميكسات ورضعات لحد الوافل وأم علي. الأسعار بالجنيه حسب المنيو المنشور.`}
          />
        </div>

        <LazyMotion features={loadFeatures} strict>
          {/* controls */}
          <div
            ref={controls}
            className="sticky top-(--nav-offset) z-20 -mx-4 mt-12 bg-cream px-4 py-3 shadow-[0_10px_20px_-18px_rgba(11,74,46,0.6)] transition-[top] duration-[450ms] ease-(--ease-juice) md:-mx-10 md:px-10"
          >
            <label className="relative block">
              <span className="sr-only">دوّر في المنيو</span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  keepListInView()
                }}
                placeholder="دوّر على أي حاجة… مانجو، كيوي، أم علي"
                className="h-14 w-full rounded-full border-[3px] border-forest-900 bg-white px-6 ps-14 text-lg font-semibold shadow-[0_4px_0_var(--color-forest-900)] outline-none placeholder:text-forest-900/40 focus:border-leaf-600 focus:shadow-[0_4px_0_var(--color-leaf-600)]"
              />
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 right-5 size-6 -translate-y-1/2 text-forest-900/60" aria-hidden>
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </label>

            <div className="relative mt-3">
              <div
                ref={strip}
                onScroll={syncStrip}
                role="tablist"
                aria-label="أقسام المنيو"
                className="no-scrollbar flex gap-2 overflow-x-auto pt-1 pb-2"
              >
                {MENU.map((c) => {
                  const on = !q && c.id === active
                  const tone = TONE[c.tone]
                  const Icon = ICONS[categoryIcon(c.id)]
                  return (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={on}
                      onClick={(e) => pick(c.id, e.currentTarget)}
                      className={cn(
                        'group relative flex shrink-0 items-center gap-2 rounded-full border-2 py-1 ps-1 pe-4 text-base font-bold whitespace-nowrap transition-colors',
                        on
                          ? cn('border-transparent', tone.text)
                          : 'border-forest-900/10 bg-white text-forest-900/75 hover:border-forest-900/30 hover:text-forest-900',
                      )}
                    >
                      {on && (
                        <m.span
                          layoutId="menu-chip"
                          className={cn('absolute -inset-0.5 rounded-full border-2 border-forest-900 shadow-[0_3px_0_var(--color-forest-900)]', tone.pill)}
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span
                        className={cn(
                          'relative grid size-8 place-items-center rounded-full transition-[rotate,scale] duration-500 ease-(--ease-squish)',
                          on ? '-rotate-12 scale-110 bg-white ring-2 ring-forest-900' : 'bg-cream group-hover:rotate-12',
                        )}
                      >
                        <Icon className="size-6" />
                      </span>
                      <span className="relative">{c.title}</span>
                      <span className={cn('relative text-xs font-extrabold', on ? 'opacity-75' : 'text-forest-900/35')}>
                        {toArabicDigits(c.items.length)}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* RTL: the strip starts on the right, more tabs wait on the left */}
              <div aria-hidden className={cn(fade, 'right-0 bg-gradient-to-l from-cream to-transparent', edges.atStart && 'opacity-0')} />
              <div aria-hidden className={cn(fade, 'left-0 bg-gradient-to-r from-cream to-transparent', edges.atEnd && 'opacity-0')} />
              <span className={cn('absolute top-1/2 right-0 hidden -translate-y-1/2 md:block', edges.atStart && 'invisible')}>
                <button type="button" tabIndex={-1} onClick={() => scrollStrip(-1)} aria-label="الأقسام اللي قبل" className={btn('cream', 'sm', 'size-9 !px-0')}>
                  <ArrowUpGlyph className="size-4 rotate-90" />
                </button>
              </span>
              <span className={cn('absolute top-1/2 left-0 hidden -translate-y-1/2 md:block', edges.atEnd && 'invisible')}>
                <button type="button" tabIndex={-1} onClick={() => scrollStrip(1)} aria-label="باقي الأقسام" className={btn('lime', 'sm', 'size-9 !px-0')}>
                  <ArrowUpGlyph className="size-4 -rotate-90" />
                </button>
              </span>
            </div>
          </div>

          {/* results */}
          <div ref={results} className="mt-6 min-h-[60svh]">
            {q && (
              <p className="mb-4 text-forest-900/60" aria-live="polite">
                {hits ? `${toArabicDigits(hits)} نتيجة لـ "${deferred}"` : `مفيش حاجة باسم "${deferred}"… جرّب اسم تاني`}
              </p>
            )}
            {/* one key for all searches: typing updates rows in place instead of a full fade-out per keystroke */}
            <AnimatePresence mode="wait" initial={false}>
              <m.div key={q ? 'search' : active} initial="hidden" animate="show" exit="exit" variants={list}>
                {groups.map((c) => {
                  const Icon = ICONS[categoryIcon(c.id)]
                  return (
                    <div key={c.id} className="mb-10">
                      <div className="mb-2 flex items-center gap-3 border-b-2 border-forest-900/10 pb-4 md:gap-4">
                        <span className="grid size-14 shrink-0 -rotate-6 place-items-center rounded-full bg-white shadow-[0_4px_0_var(--color-forest-900)] ring-[3px] ring-forest-900 md:size-16">
                          <Icon className="size-10 md:size-11" />
                        </span>
                        <h3 className={sticker(TONE[c.tone].fill, 'dark', 'min-w-0 text-[clamp(2rem,8vw,3rem)] leading-[1.3] font-extrabold')}>{c.title}</h3>
                        <span className="ms-auto shrink-0 rounded-full bg-forest-900/5 px-3 py-1 text-sm font-bold text-forest-900/55">
                          {toArabicDigits(c.items.length)} صنف
                        </span>
                      </div>
                      <ul className="grid gap-x-10 lg:grid-cols-2">
                        {c.items.map((it) => (
                          <m.li
                            key={`${c.id}:${it.name}`}
                            variants={row}
                            // tiny phones (<360px): prices drop under the name instead of squeezing it to a word per line
                            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5 gap-y-2 border-b border-dashed border-forest-900/10 py-3 max-[359px]:grid-cols-[auto_1fr] md:gap-x-3"
                          >
                            <FruitStack icons={iconsFor(c.id, it.name)} />
                            <ItemName name={it.name} />
                            <PriceTags prices={it.prices} sizes={c.sizes} className="max-[359px]:col-start-2 max-[359px]:justify-self-end" />
                          </m.li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </m.div>
            </AnimatePresence>
          </div>
        </LazyMotion>

        <p className="mt-6 text-sm text-forest-900/50">
          * الأسعار بالجنيه ومنقولة من{' '}
          <a href={BRAND.links.menu} target="_blank" rel="noreferrer" className="font-bold text-leaf-600 underline underline-offset-4">
            المنيو الرسمي
          </a>{' '}
          (الزجاجة = ٩٠٠ مل) وممكن تختلف من فرع لفرع — اتأكد من الفرع أو كلّم ١٧٣٧٠.
        </p>
      </div>
    </section>
  )
}
