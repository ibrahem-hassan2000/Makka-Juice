/**
 * Long page, cheap frames. Off-screen sections skip rendering (`content-visibility: auto`), so Chrome neither
 * paints them nor re-layerizes their thousands of paint chunks whenever something on screen repaints — on a
 * throttled phone that halved the layer count (71 → 35) and roughly doubled the frame rate in most sections.
 *
 * Each section keeps its exact height: its content box is measured while rendered and pinned with
 * `contain-intrinsic-block-size: auto <h>px` (the browser then keeps the last rendered size), so nothing moves
 * and every ScrollTrigger position stays valid. Pinned sections (hero, signatures) and the footer (its wave
 * overflows upwards) are left alone.
 */
const SECTIONS = ['#story', '#menu', '#bottles', '#branches', '#order']

export function skipOffscreen() {
  if (!CSS.supports('content-visibility', 'auto')) return () => {}
  const els = SECTIONS.map((s) => document.querySelector<HTMLElement>(s)).filter((el): el is HTMLElement => !!el)

  const apply = () => {
    els.forEach((el) => el.style.setProperty('content-visibility', 'visible'))
    const heights = els.map((el) => {
      const cs = getComputedStyle(el)
      const edges = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'] as const
      return el.offsetHeight - edges.reduce((s, k) => s + parseFloat(cs[k]), 0)
    })
    els.forEach((el, i) => {
      el.style.setProperty('contain-intrinsic-block-size', `auto ${Math.round(heights[i])}px`)
      el.style.setProperty('content-visibility', 'auto')
    })
  }
  apply()

  // a new width can change every section's height: re-measure once the resize settles
  let timer = 0
  const onResize = () => {
    clearTimeout(timer)
    timer = window.setTimeout(apply, 300)
  }
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    clearTimeout(timer)
    els.forEach((el) => {
      el.style.removeProperty('content-visibility')
      el.style.removeProperty('contain-intrinsic-block-size')
    })
  }
}
