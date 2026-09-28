const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** 17370 → ١٧٣٧٠ · 1.5 → ١٫٥ */
export const toArabicDigits = (value: number | string) =>
  String(value)
    .replace(/(\d)\.(\d)/g, '$1٫$2')
    .replace(/\d/g, (d) => AR_DIGITS[Number(d)])

/**
 * Closed SVG path whose top edge is a sine-ish wave — used for every liquid surface.
 * The wave repeats every `period` units so translating it by `period` loops seamlessly.
 */
export function wavePath(width: number, height: number, amp = 8, period = 120) {
  const half = period / 2
  let d = `M0 0 Q${half / 2} ${-amp} ${half} 0`
  for (let x = half; x < width; x += half) d += ` T${x + half} 0`
  return `${d} V${height} H0 Z`
}

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

/** Loose Arabic matching: ignore hamza forms, taa marbuta, alef maqsura and tashkeel. */
export const normalizeAr = (s: string) =>
  s
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
