import { useEffect } from 'react'
import { Cursor } from './components/layout/Cursor'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Preloader } from './components/layout/Preloader'
import { initLenis, onReady } from './lib/lenis'
import { skipOffscreen } from './lib/offscreen'
import { ScrollTrigger } from './lib/gsap'
import { Bottles } from './sections/Bottles'
import { Branches } from './sections/Branches'
import { FruitMarquee } from './sections/FruitMarquee'
import { HotlineCTA } from './sections/HotlineCTA'
import { JuiceHero } from './sections/JuiceHero'
import { MenuExplorer } from './sections/MenuExplorer'
import { Signatures } from './sections/Signatures'
import { Story } from './sections/Story'

export default function App() {
  useEffect(() => {
    // The hero is a story that starts at frame 0 — never restore a mid-page scroll on reload.
    // (ScrollTrigger keeps its own scroll memory and flips scrollRestoration back to "auto".)
    ScrollTrigger.clearScrollMemory('manual')
    const toTop = () => window.scrollTo(0, 0)
    window.addEventListener('beforeunload', toTop)
    toTop()
    initLenis()?.scrollTo(0, { immediate: true, force: true })
    // fonts change text metrics → recompute every pin/trigger once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    // Menu tabs / search and the branch finder change the page height. ScrollTrigger only re-measures on
    // resize, so without this every animation below them (bottles, map route, 17370 fill) fires at stale positions.
    // A refresh re-measures everything (~100–300 ms on phones), so it only runs once scrolling has settled.
    const main = document.querySelector('main')!
    let height = main.offsetHeight
    let lastScroll = 0
    let timer = 0
    const onScroll = () => (lastScroll = performance.now())
    const settleThenRefresh = () => {
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (performance.now() - lastScroll < 250) return settleThenRefresh()
        if (Math.abs(main.offsetHeight - height) < 24) return
        height = main.offsetHeight
        ScrollTrigger.refresh()
      }, 220)
    }
    const ro = new ResizeObserver(() => {
      if (Math.abs(main.offsetHeight - height) >= 24) settleThenRefresh()
    })
    ro.observe(main)
    window.addEventListener('scroll', onScroll, { passive: true })

    // once the page has settled (preloader gone, fonts in), off-screen sections stop being rendered
    let stopSkipping = () => {}
    let raf = 0
    const offReady = onReady(() => {
      document.fonts.ready.then(() => {
        raf = requestAnimationFrame(() => (stopSkipping = skipOffscreen()))
      })
    })

    return () => {
      offReady()
      cancelAnimationFrame(raf)
      stopSkipping()
      window.removeEventListener('beforeunload', toTop)
      window.removeEventListener('scroll', onScroll)
      ro.disconnect()
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <Preloader />
      <Cursor />
      <Header />
      <main>
        <JuiceHero />
        <FruitMarquee />
        <Story />
        <Signatures />
        <MenuExplorer />
        <Bottles />
        <Branches />
        <HotlineCTA />
      </main>
      <Footer />
    </>
  )
}
