/**
 * "Juicy" type (first used on the 17370): text filled with a juice colour + a tone-on-tone fruit print, cream rim,
 * dark edge. The CSS lives in index.css (.juicy-fill / .juicy-edge); `JuicyText` puts the two layers together.
 * Tiles are tiny inline SVGs (60×60) drawn at 0.34em, so the print scales with the text.
 */
const svg = (inner: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'>${inner}</svg>`,
  )}")`

/** two fruits per tile, offset + turned, plus a couple of specks so the print reads as a pattern */
const tile = (fruit: string, speck: string) =>
  svg(
    `<g transform='translate(15 15) rotate(-18)'>${fruit}</g><g transform='translate(45 45) rotate(24)'>${fruit}</g>` +
      `<circle cx='46' cy='13' r='1.8' fill='${speck}'/><circle cx='12' cy='46' r='1.4' fill='${speck}'/><circle cx='31' cy='30' r='1.1' fill='${speck}'/>`,
  )

const STRAWBERRY =
  "<path d='M0 9C-6 6-9 1-8-3C-7-6-4-7-2-6L0-5 2-6C4-7 7-6 8-3 9 1 6 6 0 9Z' fill='#ff9aa2'/>" +
  "<path d='M0-4C-2-6-5-6-7-5-5-4-4-4-3-3-5-2-6-1-6 1-3 1-2-1 0-2 2-1 3 1 6 1 6-1 5-2 3-3 4-4 5-4 7-5 5-6 2-6 0-4Z' fill='#43a047'/>" +
  "<circle cx='-3' cy='1' r='.9' fill='#ffe08a'/><circle cx='3' cy='1' r='.9' fill='#ffe08a'/><circle cx='0' cy='5' r='.9' fill='#ffe08a'/>"
const MANGO =
  "<path d='M-7-2C-5-8 5-9 8-2 10 4 4 9-2 8-7 7-9 2-7-2Z' fill='#ffd166'/>" +
  "<ellipse cx='3' cy='2' rx='3' ry='4' fill='#f4743b' opacity='.55'/>" +
  "<path d='M-4-6C-3-10 2-11 5-9 3-6-1-5-4-6Z' fill='#43a047'/>"
const KIWI =
  "<circle r='8.5' fill='#5d4037'/><circle r='7.3' fill='#aed581'/><circle r='3.2' fill='#f1f8e9'/>" +
  [0, 1, 2, 3, 4, 5, 6, 7]
    .map((k) => `<circle cx='${(5 * Math.cos((k * Math.PI) / 4)).toFixed(2)}' cy='${(5 * Math.sin((k * Math.PI) / 4)).toFixed(2)}' r='.8' fill='#1b1b1b'/>`)
    .join('')
const ORANGE =
  "<circle r='8.5' fill='#ffe0b2'/><circle r='7' fill='#ffb74d'/>" +
  "<path d='M0-7V7M-6.1-3.5 6.1 3.5M-6.1 3.5 6.1-3.5' stroke='#ffe0b2' stroke-width='1.2'/><circle r='1.3' fill='#ffe0b2'/>"
const BERRIES =
  "<circle cx='-4' cy='2' r='4.2' fill='#b39ddb'/><circle cx='4' cy='2' r='4.2' fill='#9575cd'/><circle cx='0' cy='-4.5' r='4.2' fill='#c5b3e6'/>" +
  "<circle cx='-4' cy='2' r='1' fill='#4527a0'/><circle cx='4' cy='2' r='1' fill='#4527a0'/><circle cx='0' cy='-4.5' r='1' fill='#4527a0'/>"

export type JuiceKey = 'strawberry' | 'mango' | 'kiwi' | 'orange' | 'berries'

/** a juice colour + its own fruit print */
export const JUICE: Record<JuiceKey, { juice: string; tile: string }> = {
  strawberry: { juice: '#e8434f', tile: tile(STRAWBERRY, '#ffc2c7') },
  mango: { juice: '#f9a825', tile: tile(MANGO, '#fff3c4') },
  kiwi: { juice: '#7cb342', tile: tile(KIWI, '#dcedc8') },
  orange: { juice: '#fb8c00', tile: tile(ORANGE, '#ffe0b2') },
  berries: { juice: '#7e57c2', tile: tile(BERRIES, '#d1c4e9') },
}

/** fizz print, for text filled with a mix of juices */
export const BUBBLES = svg(
  "<circle cx='12' cy='14' r='4.2' fill='#fff' fill-opacity='.38'/><circle cx='40' cy='28' r='2.6' fill='#fff' fill-opacity='.45'/>" +
    "<circle cx='22' cy='46' r='3.2' fill='#fff' fill-opacity='.3'/><circle cx='51' cy='9' r='1.8' fill='#fff' fill-opacity='.5'/>" +
    "<circle cx='52' cy='51' r='3.6' fill='#fff' fill-opacity='.26'/><circle cx='33' cy='5' r='1.2' fill='#fff' fill-opacity='.5'/>",
)

/** layered juices, bottom → top (like the liquid in the cup) — usable as the `juice` of a JuicyText */
export const layered = (colors: string[]) => {
  if (colors.length < 2) return colors[0] ?? '#c6f36b'
  const step = 100 / colors.length
  return `linear-gradient(to top, ${colors.map((c, n) => `${c} ${n * step}% ${(n + 1) * step}%`).join(', ')})`
}
