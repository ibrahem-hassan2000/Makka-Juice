import { useId } from 'react'
import { wavePath } from '../../lib/utils'
import { IceCube, KiwiSlice, MintLeaf, Strawberry } from './fruits'

/**
 * Makka's clear plastic cup (wave-line print + "لو عصير يبقى مكة"), drawn in SVG.
 * - static mode: layers sit at their final level (used in cards)
 * - animated mode: every part is exposed through class names so a GSAP timeline
 *   scoped to the parent can choreograph it (used in the hero).
 */
export const CUP_GEOMETRY = { rimY: 110, bottomY: 404, fillTop: 134, width: 300, height: 420 }

const BODY = 'M24 110H276L240 392Q238 404 226 404H74Q62 404 60 392Z'
const WAVE = wavePath(600, 320, 7, 120)
const PRINT_LINES = [296, 312, 328, 344, 360, 376]
const lineWave = (y: number) => {
  let d = `M0 ${y} Q15 ${y - 6} 30 ${y}`
  for (let x = 30; x < 300; x += 30) d += ` T${x + 30} ${y}`
  return d
}
const BUBBLES: Array<[number, number, number]> = [
  [96, 2.6, 0], [132, 3.4, 0.9], [168, 2.2, 1.6], [204, 3, 0.4], [118, 2, 2.2], [186, 2.8, 1.2],
]
const SPLASH: Array<[number, number, number]> = [
  [-70, -60, 7], [-42, -92, 5], [-14, -70, 6], [18, -98, 4.5], [44, -66, 6.5], [74, -84, 5], [96, -40, 4], [-96, -34, 4.5],
]

interface CupProps {
  layers: string[]
  animated?: boolean
  print?: 'dark' | 'light'
  straw?: boolean
  cream?: boolean
  garnish?: boolean
  ice?: boolean
  bubbles?: boolean
  className?: string
  title?: string
}

export function Cup({
  layers,
  animated = false,
  print = 'dark',
  straw = true,
  cream = true,
  garnish = true,
  ice = true,
  bubbles = true,
  className,
  title,
}: CupProps) {
  const id = useId()
  const { bottomY, fillTop } = CUP_GEOMETRY
  const span = (bottomY - fillTop) / layers.length
  const tops = layers.map((_, n) => Math.round(bottomY - span * (n + 1)))
  const ink = print === 'dark' ? '#0b4a2e' : '#fff8e7'
  const at = (top: number) => (animated ? undefined : `translate(0 ${top})`)

  return (
    <svg
      viewBox="0 0 300 420"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      overflow="visible"
    >
      <defs>
        <clipPath id={`${id}c`}>
          <path d={BODY} />
        </clipPath>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#fff" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9ec4" />
          <stop offset=".5" stopColor="#f48fb1" />
          <stop offset="1" stopColor="#d9658f" />
        </linearGradient>
      </defs>

      {straw && (
        <g className="cup-straw">
          <g transform="rotate(12 184 300)">
            <rect x="176" y="-4" width="17" height="380" rx="8.5" fill={`url(#${id}s)`} />
            <rect x="180" y="4" width="4" height="360" rx="2" fill="#fff" opacity=".5" />
          </g>
        </g>
      )}

      <g clipPath={`url(#${id}c)`}>
        <rect x="0" y="100" width="300" height="320" fill="#fff" opacity=".06" />
        {[...layers].reverse().map((color, rev) => {
          const n = layers.length - 1 - rev
          return (
            <g key={n} className="cup-layer" data-top={tops[n]} transform={at(tops[n])}>
              <g transform="translate(-150 0)">
                {/* only the hero cup's liquid moves — nine sloshing cups in the gallery repainted every frame */}
                <path
                  className={animated ? 'animate-wave' : undefined}
                  style={animated ? { animationDuration: `${2.2 + n * 0.7}s`, animationDirection: n % 2 ? 'reverse' : 'normal' } : undefined}
                  d={WAVE}
                  fill={color}
                />
              </g>
            </g>
          )
        })}
        <g className="cup-bubbles" opacity={animated ? 0 : 1}>
          {bubbles && BUBBLES.map(([x, r, delay]) => (
            <circle
              key={x}
              className="animate-bubble"
              style={{ animationDelay: `${delay}s` }}
              cx={x}
              cy="396"
              r={r}
              fill="#fff"
              opacity=".7"
            />
          ))}
        </g>
      </g>

      {ice && (
        <g className="cup-ice">
          {[
            [66, 120, -14],
            [126, 112, 10],
            [186, 122, -6],
          ].map(([x, y, r]) => (
            <g key={x} className="cup-ice-cube" transform={`rotate(${r} ${x + 22} ${y + 22})`}>
              <IceCube x={x} y={y} width="46" height="46" />
            </g>
          ))}
        </g>
      )}

      {cream && (
        <g className="cup-cream">
          <path
            d="M40 128c-6-26 18-44 42-38 4-26 38-40 62-24 18-20 58-12 64 14 26-4 50 18 44 48Z"
            fill="#fff8e7"
          />
          <path d="M60 124c10-8 26-10 40-4m30-6c14-10 36-10 50 0" stroke="#ecdcb8" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* glass front */}
      <path d={BODY} fill={`url(#${id}g)`} stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" />
      <path d="M44 128 70 380" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".22" />
      <path d="M254 136 244 220" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".25" />

      {/* print: wave lines + slogan, like the real cup */}
      <g clipPath={`url(#${id}c)`} stroke={ink} strokeWidth="3" fill="none" opacity=".9">
        {PRINT_LINES.map((y) => (
          <path key={y} d={lineWave(y)} />
        ))}
      </g>
      <g fill={ink} fontWeight="800" textAnchor="middle" fontSize="30" style={{ fontFamily: 'inherit' }}>
        <text x="150" y="214">
          لو عصير
        </text>
        <text x="150" y="246">
          يبقى
        </text>
        <text x="150" y="280" fontSize="36">
          مكة
        </text>
      </g>

      <rect x="14" y="100" width="272" height="16" rx="8" fill="#fff" fillOpacity=".3" stroke="#fff" strokeOpacity=".75" strokeWidth="2" />

      {garnish && (
        <g className="cup-garnish">
          <g className="cup-garnish-kiwi">
            <KiwiSlice x="212" y="58" width="84" height="84" />
          </g>
          <g className="cup-garnish-berry">
            <Strawberry x="128" y="36" width="64" height="64" />
          </g>
          <g className="cup-garnish-mint">
            <MintLeaf x="82" y="52" width="46" height="46" />
          </g>
        </g>
      )}

      {animated &&
        layers.map((color, n) => (
          <g key={n} className="cup-splash" data-i={n}>
            {SPLASH.map(([dx, dy, r], k) => (
              <circle key={k} cx="150" cy="116" r={r} fill={color} data-dx={dx} data-dy={dy} opacity="0" />
            ))}
          </g>
        ))}
    </svg>
  )
}
