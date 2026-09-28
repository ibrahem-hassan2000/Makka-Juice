import type { ReactNode, SVGProps } from 'react'

/**
 * Light 48×48 flat icons (no gradients/ids, ≤ ~10 nodes each) — cheap enough to repeat in every menu row.
 * The big detailed fruits in fruits.tsx stay for hero / hero-sized art.
 */
type P = SVGProps<SVGSVGElement>

const I = ({ children, ...p }: P & { children: ReactNode }) => (
  <svg viewBox="0 0 48 48" aria-hidden {...p}>
    {children}
  </svg>
)

const ring = (n: number, r: number, cx = 24, cy = 24, phase = 0) =>
  Array.from({ length: n }, (_, k) => {
    const a = ((k / n) * 360 + phase) * (Math.PI / 180)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  })

const Mango = (p: P) => (
  <I {...p}>
    <path d="M15 15c9-8 25-5 27 9 2 13-10 20-20 18C11 40 5 29 9 21c1-3 3-5 6-6Z" fill="#ffb627" />
    <path d="M31 17c7 4 9 13 4 19-3 4-8 6-13 6 10-4 13-13 9-25Z" fill="#f4743b" opacity=".85" />
    <path d="M14 15c1-6 8-10 15-8-3 6-9 9-15 8Z" fill="#3fa34d" />
    <ellipse cx="17" cy="25" rx="3" ry="5.5" fill="#fff" opacity=".35" transform="rotate(25 17 25)" />
  </I>
)

const Strawberry = (p: P) => (
  <I {...p}>
    <path d="M24 44C13 39 7 29 9 21c1-5 6-7 10-6 2 0 4 1 5 2 1-1 3-2 5-2 4-1 9 1 10 6 2 8-4 18-15 23Z" fill="#e8323f" />
    {[[17, 25], [24, 23], [31, 25], [20, 32], [28, 32], [24, 38]].map(([x, y]) => (
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="1.1" ry="1.7" fill="#ffe08a" />
    ))}
    <path d="M24 18c-3-4-9-4-12-2 3 1 5 2 7 4-3 1-5 3-6 6 5-1 8-4 11-6 3 2 6 5 11 6-1-3-3-5-6-6 2-2 4-3 7-4-3-2-9-2-12 2Z" fill="#3fa34d" />
  </I>
)

const citrus = (rind: string, pith: string, flesh: string) => (p: P) => (
  <I {...p}>
    <circle cx="24" cy="24" r="20" fill={rind} />
    <circle cx="24" cy="24" r="17" fill={pith} />
    <circle cx="24" cy="24" r="15" fill={flesh} />
    <path d="M24 9v30M11 16.5l26 15M11 31.5l26-15" stroke={pith} strokeWidth="1.8" />
    <circle cx="24" cy="24" r="2.2" fill={pith} />
  </I>
)
const Orange = citrus('#f57c00', '#fff1d6', '#ffa726')
const Lemon = citrus('#f2c200', '#fffbe0', '#ffe45c')

const Kiwi = (p: P) => (
  <I {...p}>
    <circle cx="24" cy="24" r="20" fill="#7a5230" />
    <circle cx="24" cy="24" r="17.5" fill="#8bc34a" />
    <circle cx="24" cy="24" r="10" fill="#cde88a" />
    {ring(10, 12.5).map(([x, y]) => (
      <circle key={x} cx={x} cy={y} r="1.2" fill="#2b1d0e" />
    ))}
    <ellipse cx="24" cy="24" rx="5" ry="3.5" fill="#f4fbd0" />
  </I>
)

const Avocado = (p: P) => (
  <I {...p}>
    <path d="M24 4c6 0 9 7 10 13 2 7 7 12 6 20-1 7-8 9-16 9S9 44 8 37c-1-8 4-13 6-20 1-6 4-13 10-13Z" fill="#2f5d1e" />
    <path d="M24 8c4 0 7 6 8 11 2 6 6 11 5 17-1 5-6 7-13 7s-12-2-13-7c-1-6 3-11 5-17 1-5 4-11 8-11Z" fill="#c8e27a" />
    <circle cx="24" cy="33" r="7" fill="#8a5a2b" />
    <circle cx="22" cy="31" r="2" fill="#fff" opacity=".35" />
  </I>
)

const Banana = (p: P) => (
  <I {...p}>
    <path d="M6 13c2-3 5-3 6 0 4 12 14 21 29 21 3 0 5 2 3 4-3 4-11 5-18 3C14 38 6 27 6 13Z" fill="#ffd93b" />
    <path d="M11 16c4 11 13 20 27 20" stroke="#e0a800" strokeWidth="1.5" fill="none" opacity=".7" />
    <path d="M6 13c-1-2 0-4 2-5l2 3Z" fill="#6d4c2f" />
  </I>
)

const Mint = (p: P) => (
  <I {...p}>
    <path d="M6 42c2-18 16-33 36-36-2 20-16 34-36 36Z" fill="#46a843" />
    <path d="M7 41C18 30 29 19 41 7" stroke="#b6f0a8" strokeWidth="1.6" fill="none" />
    <path d="M17 31c3 0 6-1 8-3M24 24c3 0 6-1 8-3M17 31c0-3 1-6 3-8M24 24c0-3 1-6 3-8" stroke="#b6f0a8" strokeWidth="1.2" fill="none" />
  </I>
)

const Arugula = (p: P) => (
  <I {...p}>
    <path d="M24 45V13" stroke="#2e7d32" strokeWidth="2.4" strokeLinecap="round" />
    <path
      d="M24 14c-6-6-4-12 0-12s6 6 0 12Zm0 9c-9-2-12-9-8-11 4-1 9 3 8 11Zm0 0c9-2 12-9 8-11-4-1-9 3-8 11Zm0 10c-10 0-14-7-10-9 4-2 10 2 10 9Zm0 0c10 0 14-7 10-9-4-2-10 2-10 9Z"
      fill="#3c9a3f"
    />
  </I>
)

const Berries = (p: P) => (
  <I {...p}>
    <circle cx="17" cy="28" r="10" fill="#3f51b5" />
    <circle cx="31" cy="23" r="9" fill="#5c6bc0" />
    <circle cx="26" cy="36" r="8" fill="#303f9f" />
    <path d="M14 20.5l3 2.5 3-2.5M28 15.5l3 2.5 3-2.5" stroke="#1a1446" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="13.5" cy="25" r="2.2" fill="#fff" opacity=".35" />
  </I>
)

const Watermelon = (p: P) => (
  <I {...p}>
    <path d="M4 16h40c0 14-9 24-20 24S4 30 4 16Z" fill="#2e7d32" />
    <path d="M7 16h34c0 12-7 21-17 21S7 28 7 16Z" fill="#e8f5c8" />
    <path d="M9 16h30c0 10-6 18-15 18S9 26 9 16Z" fill="#ef4f5f" />
    {[[18, 21], [24, 24], [30, 21], [21, 28], [27, 28]].map(([x, y]) => (
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="1" ry="1.6" fill="#2b1d0e" />
    ))}
  </I>
)

const Pomegranate = (p: P) => (
  <I {...p}>
    <circle cx="24" cy="27" r="16" fill="#c62828" />
    <path d="M17 11l3 6h8l3-6-4 2-3-4-3 4Z" fill="#8e1b1b" />
    <ellipse cx="17" cy="23" rx="3.5" ry="6" fill="#fff" opacity=".25" transform="rotate(30 17 23)" />
  </I>
)

const Grapes = (p: P) => (
  <I {...p}>
    <path d="M24 12V5M24 8c3-3 8-4 12-2-3 3-8 4-12 2Z" stroke="#5d7a2a" strokeWidth="2" fill="#3fa34d" strokeLinecap="round" />
    {[[17, 17], [24, 16], [31, 17], [20, 24], [28, 24], [16, 31], [24, 31], [32, 31], [20, 38], [28, 38], [24, 44]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="4.4" fill={y % 2 ? '#7b3fa0' : '#8e44ad'} />
    ))}
  </I>
)

const Apple = (p: P) => (
  <I {...p}>
    <path d="M24 14c-4-3-12-3-15 4-4 9 2 24 9 25 3 0 4-2 6-2s3 2 6 2c7-1 13-16 9-25-3-7-11-7-15-4Z" fill="#e53935" />
    <path d="M24 14c0-4 2-7 5-9" stroke="#6d4c2f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M26 10c3-4 8-4 11-2-3 3-7 4-11 2Z" fill="#3fa34d" />
    <ellipse cx="15" cy="24" rx="2.5" ry="5" fill="#fff" opacity=".3" transform="rotate(20 15 24)" />
  </I>
)

const Pineapple = (p: P) => (
  <I {...p}>
    <path d="M24 18l-6-12 5 6-1-10 3 9 3-8-1 10 5-5-5 10Z" fill="#3fa34d" />
    <ellipse cx="24" cy="31" rx="11" ry="14" fill="#f9b233" />
    <g fill="#c77d12">
      {[[19, 24], [24, 22], [29, 24], [21, 30], [27, 30], [18, 36], [24, 36], [30, 36], [21, 41], [27, 41]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" />
      ))}
    </g>
  </I>
)

const Dates = (p: P) => (
  <I {...p}>
    <ellipse cx="18" cy="27" rx="7" ry="12" fill="#8d4f1f" transform="rotate(-15 18 27)" />
    <ellipse cx="30" cy="25" rx="7" ry="12" fill="#a8692f" transform="rotate(15 30 25)" />
    <ellipse cx="16" cy="23" rx="1.6" ry="4" fill="#fff" opacity=".3" transform="rotate(-15 16 23)" />
    <ellipse cx="28" cy="21" rx="1.6" ry="4" fill="#fff" opacity=".3" transform="rotate(15 28 21)" />
  </I>
)

const Guava = (p: P) => (
  <I {...p}>
    <circle cx="24" cy="24" r="19" fill="#8bc34a" />
    <circle cx="24" cy="24" r="16" fill="#f8b4b4" />
    <circle cx="24" cy="24" r="8" fill="#f48a8a" />
    {ring(8, 11, 24, 24, 20).map(([x, y]) => (
      <circle key={x} cx={x} cy={y} r="1.3" fill="#fff4dc" />
    ))}
  </I>
)

const Cherry = (p: P) => (
  <I {...p}>
    <path d="M16 30c2-10 7-19 15-25M32 29c-1-8-1-16-1-24" stroke="#5d7a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M31 5c4-2 9-1 11 2-4 2-8 1-11-2Z" fill="#3fa34d" />
    <circle cx="15" cy="35" r="8" fill="#c62828" />
    <circle cx="32" cy="34" r="8" fill="#e53935" />
    <circle cx="12" cy="32" r="2" fill="#fff" opacity=".35" />
  </I>
)

const stoneFruit = (skin: string, cleft: string) => (p: P) => (
  <I {...p}>
    <circle cx="24" cy="27" r="16" fill={skin} />
    <path d="M24 12c-3 6-3 20 0 30" stroke={cleft} strokeWidth="2" fill="none" />
    <path d="M25 12c3-5 9-6 13-4-3 4-8 5-13 4Z" fill="#3fa34d" />
    <ellipse cx="16" cy="24" rx="3" ry="5" fill="#fff" opacity=".3" />
  </I>
)
const Peach = stoneFruit('#ffab76', '#f2785c')
const Apricot = stoneFruit('#ffa726', '#ef8a17')

const Plum = (p: P) => (
  <I {...p}>
    <ellipse cx="24" cy="28" rx="14" ry="16" fill="#6a1b9a" />
    <path d="M24 12c3-5 9-6 13-4-3 4-8 5-13 4Z" fill="#3fa34d" />
    <ellipse cx="17" cy="24" rx="3" ry="5.5" fill="#fff" opacity=".25" />
  </I>
)

const Cantaloupe = (p: P) => (
  <I {...p}>
    <path d="M4 18h40c0 13-9 22-20 22S4 31 4 18Z" fill="#b8cc84" />
    <path d="M7 18h34c0 11-7 19-17 19S7 29 7 18Z" fill="#ffab5e" />
    <path d="M13 18h22c0 6-5 10-11 10s-11-4-11-10Z" fill="#ffd08a" />
  </I>
)

const PricklyPear = (p: P) => (
  <I {...p}>
    <ellipse cx="24" cy="26" rx="12" ry="16" fill="#f0843a" />
    <path d="M18 11c3-2 9-2 12 0" stroke="#7cb342" strokeWidth="3" strokeLinecap="round" />
    {[[19, 20], [28, 18], [23, 27], [30, 30], [18, 32], [25, 37]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill="#ffe0b2" />
    ))}
  </I>
)

const Dragon = (p: P) => (
  <I {...p}>
    <ellipse cx="24" cy="27" rx="13" ry="16" fill="#e0457b" />
    <path d="M13 22c4 0 6 3 6 6M35 22c-4 0-6 3-6 6M24 11c-3 3-3 7-1 10M18 37c3-1 5 1 6 4M30 37c-3-1-5 1-6 4" stroke="#8bc34a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </I>
)

const Physalis = (p: P) => (
  <I {...p}>
    <path d="M24 5c-8 6-14 14-12 24 2 8 8 12 12 12s10-4 12-12c2-10-4-18-12-24Z" fill="#e8d7a3" />
    <circle cx="24" cy="29" r="9" fill="#ff9800" />
    <circle cx="21" cy="26" r="2" fill="#fff" opacity=".4" />
  </I>
)

const Passion = (p: P) => (
  <I {...p}>
    <circle cx="24" cy="24" r="19" fill="#6a1b9a" />
    <circle cx="24" cy="24" r="15" fill="#ffca28" />
    {ring(9, 8, 24, 24, 10).map(([x, y]) => (
      <circle key={x} cx={x} cy={y} r="1.6" fill="#3e2723" />
    ))}
  </I>
)

const Coconut = (p: P) => (
  <I {...p}>
    <circle cx="24" cy="24" r="19" fill="#6d4c2f" />
    <circle cx="24" cy="24" r="14" fill="#fffaf0" />
  </I>
)

const Carrot = (p: P) => (
  <I {...p}>
    <path d="M30 14 8 40c-1 1 0 3 2 2l26-22c3-3 0-8-6-6Z" fill="#f57c00" />
    <path d="M20 26l4 3M15 32l3 2M25 20l3 2" stroke="#c75b00" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M32 14c0-6 3-10 6-11-1 4-2 7-4 9 3-2 6-3 10-2-3 3-7 5-12 4Z" fill="#3fa34d" />
  </I>
)

const Beet = (p: P) => (
  <I {...p}>
    <path d="M24 18c-4-6-10-9-13-7 1 4 7 7 13 7Zm0 0c4-6 10-9 13-7-1 4-7 7-13 7Z" fill="#3fa34d" />
    <path d="M24 18V8" stroke="#8e1b4a" strokeWidth="2" />
    <circle cx="24" cy="30" r="13" fill="#8e1b4a" />
    <path d="M24 43v3" stroke="#8e1b4a" strokeWidth="2" strokeLinecap="round" />
  </I>
)

const Chocolate = (p: P) => (
  <I {...p}>
    <rect x="10" y="6" width="28" height="36" rx="3" fill="#5d3a1a" />
    <path d="M10 17h28M10 28h28M19.3 6v22M28.6 6v22" stroke="#3e2410" strokeWidth="1.6" />
    <path d="M10 30h28v9a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3Z" fill="#46a843" />
  </I>
)

const Cookie = (p: P) => (
  <I {...p}>
    <circle cx="24" cy="24" r="18" fill="#c98a50" />
    {[[17, 18], [28, 16], [31, 27], [20, 30], [25, 24], [14, 26], [26, 34]].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" fill="#4e2c14" />
    ))}
  </I>
)

const Coffee = (p: P) => (
  <I {...p}>
    <path d="M16 14c-2-3 2-4 0-7M23 14c-2-3 2-4 0-7" stroke="#b08b6e" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M9 19h25v10a10 10 0 0 1-10 10h-5A10 10 0 0 1 9 29Z" fill="#fff8e7" stroke="#6d4c2f" strokeWidth="2.4" />
    <path d="M34 22h3a4 4 0 0 1 0 8h-3" stroke="#6d4c2f" strokeWidth="2.4" fill="none" />
    <path d="M11.5 22h20" stroke="#8d5a2b" strokeWidth="3" strokeLinecap="round" />
    <path d="M5 43h32" stroke="#6d4c2f" strokeWidth="2.4" strokeLinecap="round" />
  </I>
)

const Tea = (p: P) => (
  <I {...p}>
    <path d="M14 9h20l-2.4 30a4 4 0 0 1-4 3.6h-7.2a4 4 0 0 1-4-3.6Z" fill="#e3f2fd" stroke="#90a4ae" strokeWidth="1.8" />
    <path d="M15.2 18h17.6l-1.6 20.6a3 3 0 0 1-3 2.7h-8.4a3 3 0 0 1-3-2.7Z" fill="#c2410c" />
    <path d="M30 9c3-4 8-4 10-1-3 2-7 3-10 1Z" fill="#46a843" />
  </I>
)

const Nuts = (p: P) => (
  <I {...p}>
    <circle cx="18" cy="29" r="10" fill="#a0612b" />
    <path d="M9 26c4-6 14-6 18 0-5-2-13-2-18 0Z" fill="#6d3f19" />
    <path d="M32 11c6 4 8 14 3 22-3 4-8 4-9-1-2-8 0-17 6-21Z" fill="#c68a4e" />
    <path d="M32 15c2 5 2 11 0 15" stroke="#9c6331" strokeWidth="1.4" fill="none" />
  </I>
)

const Milk = (p: P) => (
  <I {...p}>
    <rect x="17" y="3" width="14" height="5" rx="1.5" fill="#46a843" />
    <path d="M18 8h12v5l4 6v22a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V19l4-6Z" fill="#fff" stroke="#cfd8dc" strokeWidth="1.6" />
    <rect x="14.8" y="25" width="18.4" height="9" fill="#e3f2fd" />
  </I>
)

const Yogurt = (p: P) => (
  <I {...p}>
    <path d="M10 16h28l-3 24a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3Z" fill="#fff" stroke="#cfd8dc" strokeWidth="1.6" />
    <rect x="8" y="11" width="32" height="6" rx="2" fill="#46a843" />
    <path d="M13.5 27h21" stroke="#f48fb1" strokeWidth="3" />
  </I>
)

const Honey = (p: P) => (
  <I {...p}>
    <rect x="12" y="9" width="24" height="7" rx="2" fill="#8d5a2b" />
    <path d="M14 16h20v23a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z" fill="#f5b025" />
    <path d="M14 19c0 5 3 5 3 9 0 2 3 2 3 0v-9Z" fill="#ffd166" />
  </I>
)

const IceCream = (p: P) => (
  <I {...p}>
    <path d="M15 24l9 21 9-21Z" fill="#e0a257" />
    <path d="M18 29l9 6M21 36l5 3M30 29l-9 6" stroke="#b97a33" strokeWidth="1.4" />
    <circle cx="24" cy="17" r="10" fill="#ffb3c7" />
    <circle cx="17" cy="21" r="6" fill="#fff3e0" />
    <circle cx="31" cy="21" r="6" fill="#8d5a2b" />
    <circle cx="24" cy="7" r="2.6" fill="#e53935" />
  </I>
)

const Cream = (p: P) => (
  <I {...p}>
    <path
      d="M7 40c0-6 4-9 8-9-1-5 3-9 8-8 0-5 3-10 8-10-2 4 1 7 4 9 3 2 5 6 4 9 3 1 5 4 5 9Z"
      fill="#fff8e7"
      stroke="#e6d3aa"
      strokeWidth="1.6"
    />
  </I>
)

const Bowl = (p: P) => (
  <I {...p}>
    <path d="M5 21h38c0 12-8 20-19 20S5 33 5 21Z" fill="#fff" stroke="#cfd8dc" strokeWidth="1.6" />
    <ellipse cx="24" cy="21" rx="19" ry="4.5" fill="#fff1d0" />
    <g fill="#b0703a">
      <circle cx="17" cy="20" r="1.4" />
      <circle cx="24" cy="22" r="1.4" />
      <circle cx="30" cy="20" r="1.4" />
    </g>
    <path d="M22 18c2-3 5-3 7-1" stroke="#46a843" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </I>
)

const Cake = (p: P) => (
  <I {...p}>
    <path d="M7 22 41 13v25H7Z" fill="#f7d9a8" />
    <path d="M7 22 41 13v6L7 28Z" fill="#fff8e7" />
    <path d="M7 32h34" stroke="#e8505b" strokeWidth="3" />
    <circle cx="33" cy="12" r="4" fill="#e8323f" />
  </I>
)

const Waffle = (p: P) => (
  <I {...p}>
    <rect x="7" y="9" width="34" height="30" rx="6" fill="#f2b64c" />
    <path d="M7 19h34M7 29h34M18.3 9v30M29.6 9v30" stroke="#c98322" strokeWidth="2" />
    <path d="M12 13c6 4 16 4 24-1" stroke="#8d4f1f" strokeWidth="3" fill="none" strokeLinecap="round" />
  </I>
)

const Cinnamon = (p: P) => (
  <I {...p}>
    <rect x="7" y="13" width="34" height="7" rx="3.5" fill="#a0612b" transform="rotate(-20 24 16)" />
    <rect x="7" y="27" width="34" height="7" rx="3.5" fill="#8d4f1f" transform="rotate(-20 24 30)" />
  </I>
)

const Cup = (p: P) => (
  <I {...p}>
    <path d="M28 17 33 3" stroke="#f48fb1" strokeWidth="3" strokeLinecap="round" />
    <path d="M11.3 18h25.4l-.7 8H12Z" fill="#b9d86a" />
    <path d="M12 26h24l-.7 8H12.7Z" fill="#f9a825" />
    <path d="M12.7 34h22.6l-.6 7.5a2 2 0 0 1-2 1.8H15.3a2 2 0 0 1-2-1.8Z" fill="#e8434f" />
    <path d="M10 11h28l-2.8 31.5a2 2 0 0 1-2 1.8H14.8a2 2 0 0 1-2-1.8Z" fill="none" stroke="#0b4a2e" strokeWidth="2" />
    <rect x="8" y="9" width="32" height="4" rx="2" fill="#fff" stroke="#0b4a2e" strokeWidth="1.6" />
  </I>
)

const Signature = (p: P) => (
  <I {...p}>
    <Cup />
    <path d="M40 2l1.6 4.2 4.4 1.6-4.4 1.6L40 13.6l-1.6-4.2-4.4-1.6 4.4-1.6Z" fill="#f7a531" />
  </I>
)

export const ICONS = {
  mango: Mango,
  strawberry: Strawberry,
  orange: Orange,
  lemon: Lemon,
  kiwi: Kiwi,
  avocado: Avocado,
  banana: Banana,
  mint: Mint,
  arugula: Arugula,
  berries: Berries,
  watermelon: Watermelon,
  pomegranate: Pomegranate,
  grapes: Grapes,
  apple: Apple,
  pineapple: Pineapple,
  dates: Dates,
  guava: Guava,
  cherry: Cherry,
  peach: Peach,
  apricot: Apricot,
  plum: Plum,
  cantaloupe: Cantaloupe,
  pricklyPear: PricklyPear,
  dragon: Dragon,
  physalis: Physalis,
  passion: Passion,
  coconut: Coconut,
  carrot: Carrot,
  beet: Beet,
  chocolate: Chocolate,
  cookie: Cookie,
  coffee: Coffee,
  tea: Tea,
  nuts: Nuts,
  milk: Milk,
  yogurt: Yogurt,
  honey: Honey,
  iceCream: IceCream,
  cream: Cream,
  bowl: Bowl,
  cake: Cake,
  waffle: Waffle,
  cinnamon: Cinnamon,
  cup: Cup,
  signature: Signature,
} as const

export type IconKey = keyof typeof ICONS
