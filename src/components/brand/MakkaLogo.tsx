import { useId, type SVGProps } from 'react'

/**
 * Vector recreation of the Makka Juice roundel (two hurricane glasses, "Mecca Juice" on the arc,
 * "عصير مكة" underneath). TODO: swap for the official vector once the brand shares it
 * (docs/06-assets-needed.md).
 */
const glass = (cx: number) =>
  `M${cx - 15} 50C${cx - 15} 64 ${cx - 9} 72 ${cx - 10} 82C${cx - 11} 94 ${cx - 17} 102 ${cx - 13} 114C${cx - 9} 122 ${cx + 9} 122 ${cx + 13} 114C${cx + 17} 102 ${cx + 11} 94 ${cx + 10} 82C${cx + 9} 72 ${cx + 15} 64 ${cx + 15} 50Z`

export function MakkaLogo({ title = 'عصير مكة — Makka Juice', ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={title} {...props}>
      <defs>
        <radialGradient id={`${id}bg`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#6cc452" />
          <stop offset="1" stopColor="#3f9e3f" />
        </radialGradient>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc247" />
          <stop offset="1" stopColor="#ef5a2f" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7b8a" />
          <stop offset="1" stopColor="#d9263b" />
        </linearGradient>
        <path id={`${id}l`} d="M44 146A70 70 0 0 1 44 54" />
        <path id={`${id}r`} d="M156 54A70 70 0 0 1 156 146" />
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#${id}bg)`} />
      <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />

      {/* straws + umbrellas */}
      <path d="M80 52 70 26M120 52l12-30" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 36c6-14 26-18 36-6Z" fill="#3949ab" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M118 22c10-10 30-6 34 8Z" fill="#26a69a" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />

      {/* glasses */}
      <path d={glass(84)} fill={`url(#${id}a)`} stroke="#fff" strokeWidth="3" />
      <path d={glass(116)} fill={`url(#${id}b)`} stroke="#fff" strokeWidth="3" />
      <path d="M84 120v10M116 120v10M74 132h20M106 132h20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M77 60c0 10 2 16 1 22" stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M109 60c0 10 2 16 1 22" stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <g fill="#fff" fontWeight="800" style={{ fontFamily: 'inherit' }}>
        <text fontSize="17" letterSpacing="1">
          <textPath href={`#${id}l`} startOffset="50%" textAnchor="middle">
            Mecca
          </textPath>
        </text>
        <text fontSize="17" letterSpacing="1">
          <textPath href={`#${id}r`} startOffset="50%" textAnchor="middle">
            Juice
          </textPath>
        </text>
        <text x="100" y="163" fontSize="25" textAnchor="middle">
          عصير مكة
        </text>
      </g>
    </svg>
  )
}
