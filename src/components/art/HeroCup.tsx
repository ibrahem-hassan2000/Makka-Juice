import type { CSSProperties } from 'react'
import HERO_META from '../../assets/render/hero-cup.json'
import { render } from './photos'

/**
 * The hero cup, rendered in 3D (tools/render → heroPasses) and shipped as stackable transparent sprites that
 * share one camera: back wall → straw → juice columns → juice surfaces → ice → front wall (print + shine) →
 * cream → garnish. Every part is positioned by its crop rect (fractions of the 720×1008 frame), so the stack
 * lines up at any size. The JuiceHero timeline pours it (class names below); with no animation it shows the
 * finished cup.
 */
export const HERO_CUP = HERO_META as unknown as {
  frame: [number, number]
  rects: Record<string, [number, number, number, number]>
  levels: number[]
  bottom: number
  surfaceScale: number[]
  rim: number
}

export const HERO_LAYERS = ['#e8434f', '#f9a825', '#b9d86a']

/** splash droplets per pour, in the old SVG units (viewBox 300×420) — converted to px by the timeline */
export const SPLASH: Array<[number, number, number]> = [
  [-70, -60, 7], [-42, -92, 5], [-14, -70, 6], [18, -98, 4.5], [44, -66, 6.5], [74, -84, 5], [96, -40, 4], [-96, -34, 4.5],
]

const box = (name: string): CSSProperties => {
  const [x, y, w, h] = HERO_CUP.rects[name]
  return { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }
}

function Sprite({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  return (
    <img
      src={render(`hero-${name}`)}
      alt=""
      draggable={false}
      decoding="async"
      className={`pointer-events-none absolute select-none ${className ?? ''}`}
      style={{ ...box(name), ...style }}
    />
  )
}

export function HeroCup({ className }: { className?: string }) {
  const layers = HERO_LAYERS.map((_, k) => k)
  return (
    <div className={`absolute inset-0 ${className ?? ''}`}>
      <Sprite name="back" />
      <Sprite name="straw" className="cup-straw will-change-transform" />
      {/* columns: top layer at the back, so each lower layer covers the one above it below its own level */}
      {[...layers].reverse().map((k) => (
        <div key={k} className="cup-win absolute overflow-hidden will-change-transform" data-k={k} style={box(`col-${k}`)}>
          <img
            src={render(`hero-col-${k}`)}
            alt=""
            draggable={false}
            decoding="async"
            className="cup-col pointer-events-none absolute inset-0 size-full select-none will-change-transform"
          />
        </div>
      ))}
      {layers.map((k) => (
        <Sprite
          key={k}
          name={`surf-${k}`}
          className={`cup-surf will-change-transform ${k < layers.length - 1 ? 'invisible opacity-0' : ''}`}
        />
      ))}
      <div className="cup-ice">
        {[0, 1, 2].map((i) => (
          <Sprite key={i} name={`ice-${i}`} className="cup-ice-cube will-change-transform" />
        ))}
      </div>
      <Sprite name="front" />
      <Sprite name="cream" className="cup-cream will-change-transform" />
      <div className="cup-garnish">
        {['mint', 'berry', 'kiwi'].map((g) => (
          <Sprite key={g} name={g} className="will-change-transform" />
        ))}
      </div>
      {HERO_LAYERS.map((_, k) => (
        <div key={k} className="cup-splash" data-i={k}>
          {SPLASH.map(([dx, dy, r], i) => (
            <img
              key={i}
              src={render(`hero-drop-${k}`)}
              alt=""
              draggable={false}
              data-dx={dx}
              data-dy={dy}
              className="pointer-events-none invisible absolute opacity-0 select-none"
              style={{
                left: `${50 - (r / 300) * 100}%`,
                top: `${HERO_CUP.rim * 100}%`,
                marginTop: `${-(r / 300) * 100}%`,
                width: `${((2 * r) / 300) * 100}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
