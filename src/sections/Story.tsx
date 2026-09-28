import { useRef } from 'react'
import { Floaters } from '../components/ui/Floaters'
import { JUICE, type JuiceKey } from '../components/ui/juice'
import { JuicyText } from '../components/ui/JuicyText'
import { BRANCH_COUNT, BRAND } from '../data/brand'
import { MENU_ITEM_COUNT } from '../data/menu'
import { gsap, prefersReducedMotion, SplitText, useGSAP } from '../lib/gsap'
import { toArabicDigits } from '../lib/utils'

/** compact counts in thousands (٥٤٨ ألف) so the format never flips mid-count */
const format = (el: HTMLElement, v: number) =>
  el.dataset.mode === 'compact'
    ? `${toArabicDigits(Math.round(v / 1000))} ألف`
    : toArabicDigits(Math.round(v)) + (el.dataset.suffix ?? '')

const STORY =
  'من قلب اسكندرية بدأت الحكاية بكوباية عصير فريش… ومع كل كوباية الحكاية كبرت. النهارده مكة في اسكندرية والساحل ودمنهور وطنطا والقاهرة، وكل اللي جرّبها عارف إن لو عصير… يبقى مكة.'

/** writes the value into both layers of the JuicyText (fill + edge) */
const show = (el: HTMLElement, text: string) => el.querySelectorAll('[data-juicy-text]').forEach((t) => (t.textContent = text))

// each counter ends as a juice that stands out on its card: red on lime, mango on red, kiwi on orange, berry on cream
const STATS: Array<{ value: number; label: string; juice: JuiceKey; suffix?: string; compact?: boolean; raw?: boolean }> = [
  { value: BRANCH_COUNT, suffix: '+', label: 'فرع في ٥ محافظات', juice: 'strawberry' },
  { value: BRAND.stats.facebookFollowers, compact: true, label: 'متابع على فيسبوك', juice: 'mango' },
  { value: MENU_ITEM_COUNT, suffix: '+', label: 'صنف في المنيو', juice: 'kiwi' },
  { value: 17370, raw: true, label: 'رقم واحد لكل الفروع', juice: 'berries' },
]

export function Story() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const counters = gsap.utils.toArray<HTMLElement>('.stat-num')
      if (prefersReducedMotion()) {
        counters.forEach((el) => {
          show(el, format(el, Number(el.dataset.value)))
          el.classList.add('is-juicy')
        })
        return
      }

      // word-by-word "fill" as you read
      const split = SplitText.create('.story-text', { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.story-text', start: 'top 75%', end: 'bottom 45%', scrub: true },
        },
      )

      // count-up stats
      counters.forEach((el) => {
        const target = Number(el.dataset.value)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => show(el, format(el, obj.v)),
          // counted up in plain ink → pops into juice (same moment as the 17370 further down)
          onComplete: () => {
            el.classList.add('is-juicy')
            gsap.fromTo(el.querySelector('.juicy'), { scale: 0.6, rotation: -8 }, { scale: 1, rotation: -2, duration: 0.75, ease: 'back.out(2.6)' })
          },
        })
      })

      gsap.from('.stat-card', {
        y: 60,
        rotation: (i) => (i % 2 ? 4 : -4),
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.stat-grid', start: 'top 85%', once: true },
      })
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="story" className="relative bg-forest-900 px-5 py-28 md:px-10 md:py-40">
      <div aria-hidden className="doodles absolute inset-0 opacity-[0.04]" />
      <Floaters
        items={[
          { icon: 'pomegranate', cls: 'top-[5%] -left-4 w-[clamp(52px,7vw,116px)] md:left-[3%]', depth: 1.3 },
          { icon: 'lemon', cls: 'top-[33%] -right-3 w-[clamp(40px,5vw,86px)] md:right-[2%]', depth: 1 },
          { icon: 'grapes', cls: 'top-[50%] left-[4%] hidden w-[clamp(44px,5vw,88px)] md:block', depth: 1.7 },
        ]}
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-6 text-sm font-bold tracking-widest text-lime">حكايتنا</p>
        <p className="story-text text-[clamp(1.9rem,4.6vw,4rem)] leading-[1.25] font-extrabold text-cream">{STORY}</p>

        {/* 4 across only from lg: on tablets the numbers didn't fit their cards */}
        <dl className="stat-grid mt-20 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {STATS.map((s, n) => (
            <div
              key={s.label}
              className={`stat-card flex flex-col-reverse justify-between rounded-[2rem] border-[3px] border-cream/90 p-4 shadow-[0_6px_0_rgba(4,32,15,0.6)] min-[400px]:p-6 md:p-8 ${
                ['bg-lime text-forest-900', 'bg-berry text-cream', 'bg-mango text-forest-950', 'bg-cream text-forest-900'][n]
              }`}
            >
              <dt className="mt-6 text-base font-bold opacity-80 md:text-lg">{s.label}</dt>
              <dd
                // nowrap + sized to fit the widest value: a count-up that wraps/unwraps changed the page height
                // every few frames, and each change forced a full ScrollTrigger refresh mid-scroll (~300 ms freezes)
                className="stat-num text-[clamp(1.3rem,6.8vw,4rem)] leading-none font-extrabold whitespace-nowrap tabular-nums md:text-[clamp(2.2rem,5.5vw,4rem)] lg:text-[clamp(1.8rem,3.2vw,2.9rem)]"
                data-value={s.value}
                data-mode={s.compact ? 'compact' : s.raw ? 'raw' : 'num'}
                data-suffix={s.suffix}
              >
                <JuicyText text={s.raw ? toArabicDigits(s.value) : '٠'} juice={JUICE[s.juice].juice} tile={JUICE[s.juice].tile} className="will-change-transform" />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
