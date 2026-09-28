import { useId, type SVGProps } from 'react'

/**
 * Hand-built vector fruits (viewBox 0 0 200 200). Pure SVG → zero image requests,
 * crisp at any size, and cheap to animate. Replace with real photography later if wanted
 * (docs/06-assets-needed.md).
 */
type FruitProps = SVGProps<SVGSVGElement>

const base = (props: FruitProps) => ({
  viewBox: '0 0 200 200',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  ...props,
})

const polar = (r: number, deg: number, cx = 100, cy = 100) => {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
}

const SEEDS: Array<[number, number]> = [
  [72, 100], [94, 92], [116, 92], [136, 102], [60, 124], [84, 118], [106, 116], [128, 120],
  [148, 126], [72, 146], [96, 142], [120, 144], [86, 166], [110, 166], [140, 146],
]

export function Strawberry(props: FruitProps) {
  const id = useId()
  return (
    <svg {...base(props)}>
      <defs>
        <radialGradient id={`${id}g`} cx="38%" cy="36%" r="72%">
          <stop offset="0" stopColor="#ff7a7a" />
          <stop offset=".55" stopColor="#e8323f" />
          <stop offset="1" stopColor="#a8142a" />
        </radialGradient>
      </defs>
      <path
        d="M100 190C58 172 24 126 32 86 38 60 62 50 84 56c8 2 13 5 16 8 3-3 8-6 16-8 22-6 46 4 52 30 8 40-26 86-68 104Z"
        fill={`url(#${id}g)`}
      />
      {SEEDS.map(([x, y], n) => (
        <ellipse key={n} cx={x} cy={y} rx="2.6" ry="4.2" fill="#ffe08a" transform={`rotate(${(x - 100) / 3} ${x} ${y})`} />
      ))}
      <ellipse cx="68" cy="96" rx="9" ry="20" fill="#fff" opacity=".28" transform="rotate(22 68 96)" />
      <path
        d="M100 72c-8-10-22-14-36-10 12 4 20 10 24 14-10 2-18 10-22 20 14-6 26-12 34-18 8 6 20 12 34 18-4-10-12-18-22-20 4-4 12-10 24-14-14-4-28 0-36 10Z"
        fill="#3fa34d"
      />
      <path d="M100 70c0-12 4-24 12-32" stroke="#2e7d32" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function CitrusSlice({ rind, pith, flesh, ...props }: FruitProps & { rind: string; pith: string; flesh: string }) {
  const wedges = Array.from({ length: 9 }, (_, n) => {
    const a0 = n * 40 + 3
    const a1 = a0 + 34
    const [x0, y0] = polar(12, a0)
    const [x1, y1] = polar(74, a0)
    const [x2, y2] = polar(74, a1)
    const [x3, y3] = polar(12, a1)
    return `M${x0} ${y0}L${x1} ${y1}A74 74 0 0 1 ${x2} ${y2}L${x3} ${y3}Z`
  })
  return (
    <svg {...base(props)}>
      <circle cx="100" cy="100" r="94" fill={rind} />
      <circle cx="100" cy="100" r="84" fill={pith} />
      {wedges.map((d, n) => (
        <path key={n} d={d} fill={flesh} stroke={flesh} strokeWidth="6" strokeLinejoin="round" />
      ))}
      <circle cx="100" cy="100" r="7" fill={pith} />
      <path d="M52 50a70 70 0 0 1 40-22" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".45" fill="none" />
    </svg>
  )
}

export const OrangeSlice = (props: FruitProps) => (
  <CitrusSlice rind="#f57c00" pith="#fff1d6" flesh="#ffa726" {...props} />
)
export const LemonSlice = (props: FruitProps) => (
  <CitrusSlice rind="#f9d423" pith="#fffbe0" flesh="#ffe45c" {...props} />
)

export function KiwiSlice(props: FruitProps) {
  const id = useId()
  return (
    <svg {...base(props)}>
      <defs>
        <radialGradient id={`${id}k`}>
          <stop offset="0" stopColor="#f4fbd0" />
          <stop offset=".32" stopColor="#c5e46a" />
          <stop offset="1" stopColor="#6aa62a" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="#7a5230" />
      <circle cx="100" cy="100" r="86" fill={`url(#${id}k)`} />
      {Array.from({ length: 18 }, (_, n) => {
        const [x1, y1] = polar(26, n * 20)
        const [x2, y2] = polar(74, n * 20)
        return <line key={n} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e4f5a8" strokeWidth="2" opacity=".55" />
      })}
      {Array.from({ length: 26 }, (_, n) => {
        const deg = n * (360 / 26)
        const [x, y] = polar(n % 2 ? 36 : 42, deg)
        return <ellipse key={n} cx={x} cy={y} rx="2.4" ry="5" fill="#2b1d0e" transform={`rotate(${deg + 90} ${x} ${y})`} />
      })}
      <ellipse cx="100" cy="100" rx="18" ry="12" fill="#f7fbe4" />
    </svg>
  )
}

export function Mango(props: FruitProps) {
  const id = useId()
  return (
    <svg {...base(props)}>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe066" />
          <stop offset=".5" stopColor="#ffa41c" />
          <stop offset="1" stopColor="#f0503a" />
        </linearGradient>
      </defs>
      <path
        d="M58 54c46-34 112-10 118 50 6 56-48 92-94 80C36 172 16 118 30 86c6-16 16-26 28-32Z"
        fill={`url(#${id}m)`}
      />
      <ellipse cx="72" cy="92" rx="12" ry="26" fill="#fff" opacity=".3" transform="rotate(30 72 92)" />
      <path d="M62 54c-2-12 2-22 10-28" stroke="#6d4c2f" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M70 30c20-22 56-22 72-8-22 12-50 18-72 8Z" fill="#3fa34d" />
      <path d="M72 29c22-4 44-6 68-7" stroke="#a5e39a" strokeWidth="2.5" fill="none" opacity=".8" />
    </svg>
  )
}

export function AvocadoHalf(props: FruitProps) {
  const id = useId()
  const shape =
    'M100 14c24 0 36 26 42 50 8 30 30 54 26 86-6 32-34 46-68 46s-62-14-68-46c-4-32 18-56 26-86 6-24 18-50 42-50Z'
  return (
    <svg {...base(props)}>
      <defs>
        <radialGradient id={`${id}f`} cx="50%" cy="68%" r="60%">
          <stop offset="0" stopColor="#fbfbd2" />
          <stop offset=".55" stopColor="#d4e87f" />
          <stop offset="1" stopColor="#8fbf45" />
        </radialGradient>
        <radialGradient id={`${id}p`} cx="38%" cy="34%">
          <stop offset="0" stopColor="#c98a50" />
          <stop offset="1" stopColor="#6b3d1c" />
        </radialGradient>
      </defs>
      <path d={shape} fill="#2f5d1e" />
      <path d={shape} fill={`url(#${id}f)`} transform="translate(100 112) scale(.86) translate(-100 -112)" />
      <circle cx="100" cy="138" r="30" fill={`url(#${id}p)`} />
      <ellipse cx="90" cy="128" rx="8" ry="5" fill="#fff" opacity=".35" />
    </svg>
  )
}

export function Banana(props: FruitProps) {
  const id = useId()
  return (
    <svg {...base(props)}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff176" />
          <stop offset="1" stopColor="#f5c518" />
        </linearGradient>
      </defs>
      <path
        d="M24 58c6-8 14-8 18 0 16 46 58 82 118 82 12 0 22 6 16 16-8 14-36 20-64 14C62 160 28 118 24 58Z"
        fill={`url(#${id}b)`}
      />
      <path d="M42 66c16 44 54 80 118 82" stroke="#e0a800" strokeWidth="3" fill="none" opacity=".6" />
      <path d="M24 58c-2-8 2-14 8-16l6 10Z" fill="#6d4c2f" />
      <circle cx="176" cy="154" r="5" fill="#6d4c2f" />
    </svg>
  )
}

export function MintLeaf(props: FruitProps) {
  const id = useId()
  return (
    <svg {...base(props)}>
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2e8b3e" />
          <stop offset="1" stopColor="#6cd06a" />
        </linearGradient>
      </defs>
      <path d="M20 180c10-80 70-150 160-160-10 90-70 150-160 160Z" fill={`url(#${id}l)`} />
      <path d="M22 178C72 128 122 78 178 22" stroke="#b6f0a8" strokeWidth="4" fill="none" opacity=".75" />
      {[50, 80, 110, 140].map((t) => (
        <path key={t} d={`M${t} ${200 - t}c10 0 20-6 26-16M${t} ${200 - t}c0-10-6-20-16-26`} stroke="#b6f0a8" strokeWidth="2.5" fill="none" opacity=".55" />
      ))}
    </svg>
  )
}

export function Blueberries(props: FruitProps) {
  const id = useId()
  const berries: Array<[number, number, number]> = [
    [72, 116, 46],
    [130, 104, 42],
    [106, 156, 38],
  ]
  return (
    <svg {...base(props)}>
      <defs>
        <radialGradient id={`${id}u`} cx="36%" cy="32%">
          <stop offset="0" stopColor="#8c9eff" />
          <stop offset=".6" stopColor="#3f51b5" />
          <stop offset="1" stopColor="#1a237e" />
        </radialGradient>
      </defs>
      {berries.map(([cx, cy, r]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${id}u)`} />
          <path
            d={`M${cx - 8} ${cy - r + 12}l8 6 8-6-3 9 3 9-8-5-8 5 3-9Z`}
            fill="#1a1446"
            opacity=".85"
          />
          <ellipse cx={cx - r / 3} cy={cy - r / 3} rx={r / 5} ry={r / 8} fill="#fff" opacity=".35" />
        </g>
      ))}
    </svg>
  )
}

export function IceCube(props: FruitProps) {
  const id = useId()
  return (
    <svg {...base(props)}>
      <defs>
        <linearGradient id={`${id}i`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#bfe9ff" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <rect x="22" y="22" width="156" height="156" rx="34" fill={`url(#${id}i)`} stroke="#fff" strokeWidth="4" />
      <path d="M50 60c10-12 24-16 40-14" stroke="#fff" strokeWidth="10" strokeLinecap="round" fill="none" />
      <rect x="112" y="116" width="36" height="36" rx="10" fill="#fff" opacity=".35" />
    </svg>
  )
}
