import { useId } from 'react'
import { cn } from '../../lib/utils'

/**
 * "مكة على طول" take-away bottle — green cap, see-through body, brand label.
 * Three stacked layers so the Bottles section can open it cheaply:
 *   body (static SVG) · fizz (tiny SVG over the mouth) · cap (HTML layer → lifting it is compositor-only;
 *   when the cap lived inside the body SVG, every frame of the animation repainted the whole bottle).
 * All three share the body's coordinate system (viewBox 0 -60 120 364), converted to % below.
 */
const VB = { x: 0, y: -60, w: 120, h: 364 }
const BODY = 'M40 44H80V60C80 68 98 76 100 92V284Q100 298 86 298H34Q20 298 20 284V92C22 76 40 68 40 60Z'
const CAP = { x: 34, y: 4, w: 52, h: 42 }

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export function Bottle({ juice, foam = '#fff8e7', className }: { juice: string; foam?: string; className?: string; n?: number }) {
  const id = useId()
  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="block h-auto w-full" aria-hidden>
        <defs>
          <clipPath id={`${id}c`}>
            <path d={BODY} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}c)`}>
          <rect x="0" y="0" width="120" height="304" fill="#fff" opacity=".12" />
          <rect x="0" y="86" width="120" height="220" fill={juice} />
          <path d="M0 86Q30 78 60 86T120 86V96H0Z" fill={foam} opacity=".7" />
        </g>
        <path d={BODY} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" />
        {/* the open mouth + thread, revealed when the cap lifts */}
        <rect x="38" y="40" width="44" height="10" rx="3" fill="#fff" fillOpacity=".55" stroke="#fff" strokeWidth="1.5" />
        <ellipse cx="60" cy="41" rx="17" ry="3.5" fill={juice} />

        <path d="M22 150 60 128 98 150V222L60 244 22 222Z" fill="#2f8f3f" />
        <path d="M22 150 60 128 98 150V222L60 244 22 222Z" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
        <g fill="#fff" textAnchor="middle" fontWeight="800" style={{ fontFamily: 'inherit' }}>
          <text x="60" y="184" fontSize="30">
            مكة
          </text>
          <text x="60" y="210" fontSize="17" fill="#c6f36b">
            على طول
          </text>
        </g>
        <path d="M30 104V270" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".28" />
      </svg>


      <div
        className="bottle-cap absolute will-change-transform"
        style={{ left: pct(CAP.x - VB.x, VB.w), top: pct(CAP.y - VB.y, VB.h), width: pct(CAP.w, VB.w) }}
      >
        {/* idles (bobs) only once the caps are off — the section adds .caps-open */}
        <div>
          <svg viewBox={`${CAP.x} ${CAP.y} ${CAP.w} ${CAP.h}`} className="block h-auto w-full" aria-hidden>
            <defs>
              <linearGradient id={`${id}cap`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7ee06a" />
                <stop offset=".5" stopColor="#46a843" />
                <stop offset="1" stopColor="#2f8f3f" />
              </linearGradient>
            </defs>
            <rect x="34" y="4" width="52" height="42" rx="7" fill={`url(#${id}cap)`} />
            {[42, 50, 58, 66, 74].map((x) => (
              <path key={x} d={`M${x} 10v30`} stroke="#fff" strokeOpacity=".25" strokeWidth="2" />
            ))}
            <rect x="34" y="4" width="52" height="9" rx="4.5" fill="#fff" fillOpacity=".18" />
          </svg>
        </div>
      </div>
    </div>
  )
}
