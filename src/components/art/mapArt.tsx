import type { SVGProps } from 'react'

/**
 * Sticker-style doodles for the branches map (flat fills, dark outline — same language as the buttons).
 * Landmarks are real places near each branch city; they pop up when the delivery scooter gets there.
 */
type P = SVGProps<SVGSVGElement>
const INK = '#04200f'
const line = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/** Qaitbay-style lighthouse — الإسكندرية */
export const Lighthouse = (p: P) => (
  <svg viewBox="0 0 60 70" aria-hidden {...p}>
    <path d="M23 18 3 10v16ZM37 18l20-8v16Z" fill="#c6f36b" opacity=".35" />
    <path d="M30 6 21 14h18Z" fill="#e8505b" {...line} />
    <rect x="23" y="14" width="14" height="9" fill="#c6f36b" {...line} />
    <path d="M24 23 20 62h20l-4-39Z" fill="#fff8e7" {...line} />
    <path d="M22.4 38h15.2M21.3 50h17.4" stroke="#e8505b" strokeWidth="4.5" />
    <path d="M24 23 20 62h20l-4-39Z" fill="none" {...line} />
    <path d="M13 64h34" {...line} strokeWidth="3" />
  </svg>
)

/** Beach umbrella — الساحل */
export const Umbrella = (p: P) => (
  <svg viewBox="0 0 60 62" aria-hidden {...p}>
    <path d="M30 20v34" {...line} strokeWidth="3" />
    <path d="M6 22Q30-2 54 22q-6-4-12 0-6-4-12 0-6-4-12 0-6-4-12 0Z" fill="#e8505b" />
    <path d="M18 22q6-16 12-19 6 3 12 19-6-4-12 0-6-4-12 0Z" fill="#fff8e7" />
    <path d="M6 22Q30-2 54 22q-6-4-12 0-6-4-12 0-6-4-12 0-6-4-12 0Z" fill="none" {...line} />
    <path d="M6 58q6-5 12 0t12 0 12 0 12 0" fill="none" stroke="#8fd16f" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/** Date palm — البحيرة */
export const Palm = (p: P) => (
  <svg viewBox="0 0 60 64" aria-hidden {...p}>
    <path d="M31 22c-3 14-1 26-5 38" fill="none" stroke="#8a5a3c" strokeWidth="5" strokeLinecap="round" />
    <path d="M31 22c-2 14 0 26-5 38" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="2 5" />
    {[
      'M31 22C22 12 10 14 4 22c10-4 18-2 27 0Z',
      'M31 22c9-10 21-8 26 0-10-4-17-2-26 0Z',
      'M31 22C26 10 30 4 36 2c-2 8-2 14-5 20Z',
      'M31 22c-11 0-17 8-17 16 6-8 11-12 17-16Z',
      'M31 22c11 0 17 8 17 16-6-8-11-12-17-16Z',
    ].map((d) => (
      <path key={d} d={d} fill="#46a843" {...line} strokeWidth="2.2" />
    ))}
    <circle cx="28" cy="25" r="2.6" fill="#b5452b" stroke={INK} strokeWidth="1.2" />
    <circle cx="33.5" cy="25.5" r="2.6" fill="#b5452b" stroke={INK} strokeWidth="1.2" />
    <path d="M15 62h24" {...line} strokeWidth="3" />
  </svg>
)

/** Dome + minaret — طنطا */
export const Mosque = (p: P) => (
  <svg viewBox="0 0 60 64" aria-hidden {...p}>
    <path d="M42 14h8v46h-8Z" fill="#fff8e7" {...line} />
    <path d="M40 24h12" {...line} />
    <path d="m42 14 4-10 4 10Z" fill="#46a843" {...line} />
    <path d="M22 26v-6" {...line} />
    <circle cx="22" cy="18" r="2.4" fill="#c6f36b" stroke={INK} strokeWidth="1.5" />
    <path d="M8 40c0-16 28-16 28 0Z" fill="#46a843" {...line} />
    <path d="M6 40h32v20H6Z" fill="#fff8e7" {...line} />
    <path d="M18 60v-8a4 4 0 0 1 8 0v8Z" fill={INK} />
  </svg>
)

/** Pyramids — القاهرة والجيزة */
export const Pyramids = (p: P) => (
  <svg viewBox="0 0 80 58" aria-hidden {...p}>
    <circle cx="66" cy="11" r="6.5" fill="#f7a531" stroke={INK} strokeWidth="2" />
    <path d="M36 52 54 22l18 30Z" fill="#f4d58d" />
    <path d="M54 22 72 52H62Z" fill="#d7a86e" />
    <path d="M36 52 54 22l18 30Z" fill="none" {...line} />
    <path d="M4 52 26 14l22 38Z" fill="#f4d58d" />
    <path d="M26 14 48 52H36Z" fill="#d7a86e" />
    <path d="M4 52 26 14l22 38Z" fill="none" {...line} />
    <path d="M2 54h76" {...line} strokeWidth="3" />
  </svg>
)

/** Little sailboat on the sea */
export const Boat = (p: P) => (
  <svg viewBox="0 0 40 36" aria-hidden {...p}>
    <path d="M20 3v24" {...line} />
    <path d="M21.5 5 34 24H21.5Z" fill="#fff8e7" {...line} strokeWidth="2.2" />
    <path d="M18.5 10 9 24h9.5Z" fill="#c6f36b" {...line} strokeWidth="2.2" />
    <path d="M4 27h32l-5 7H9Z" fill="#e8505b" {...line} />
  </svg>
)

/** The Makka delivery scooter (faces right; wheels touch the bottom edge) */
export const Scooter = (p: P) => (
  <svg viewBox="0 0 84 64" aria-hidden {...p}>
    <rect x="6" y="6" width="30" height="26" rx="5" fill="#46a843" {...line} strokeWidth="3" />
    <path d="M21 11.5c-3.5 4.5-5.5 7-5.5 10a5.5 5.5 0 0 0 11 0c0-3-2-5.5-5.5-10Z" fill="#fff8e7" />
    <path d="M10 36h30c4 0 6-3 8-7l6-11h8l5 22c7 1 12 6 12 14H10Z" fill="#c6f36b" {...line} strokeWidth="3" />
    <path d="m58 18-3-10h9" fill="none" {...line} strokeWidth="3.5" />
    <circle cx="73" cy="44" r="3" fill="#fff8e7" stroke={INK} strokeWidth="2" />
    <circle cx="20" cy="54" r="8.5" fill={INK} />
    <circle cx="20" cy="54" r="3.2" fill="#fff8e7" />
    <circle cx="66" cy="54" r="8.5" fill={INK} />
    <circle cx="66" cy="54" r="3.2" fill="#fff8e7" />
  </svg>
)
