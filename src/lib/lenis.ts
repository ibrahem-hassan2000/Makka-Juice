import Lenis from 'lenis'
import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null
/** Remembered so a lock requested before Lenis exists (the preloader mounts first) still applies. */
let locked = false

/** Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger + Lenis share one RAF. */
export function initLenis() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, touchMultiplier: 1.4 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  if (locked) lenis.stop()
  if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis })
  return lenis
}

export const getLenis = () => lenis

export function scrollToTarget(target: string | number, duration = 1.6) {
  if (lenis) {
    lenis.scrollTo(target, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

export const lockScroll = (lock: boolean) => {
  locked = lock
  if (lenis) {
    if (lock) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

/** Where sticky UI sits while the header is showing — mirrors `--nav-offset` in index.css.
 *  (Scrolling up always brings the header back, so scroll targets must leave room for it.) */
export const headerSpace = () => (window.matchMedia('(min-width: 48rem)').matches ? 88 : 76)

/** Fired once the preloader has finished so sections can play their intro. */
export const READY_EVENT = 'makka:ready'
let ready = false
export const isReady = () => ready
export const markReady = () => {
  ready = true
  window.dispatchEvent(new Event(READY_EVENT))
}
export const onReady = (cb: () => void) => {
  if (ready) {
    cb()
    return () => {}
  }
  window.addEventListener(READY_EVENT, cb, { once: true })
  return () => window.removeEventListener(READY_EVENT, cb)
}
