import type { SVGProps } from 'react'

/** Tiny UI glyphs (currentColor) used inside buttons. */
type P = SVGProps<SVGSVGElement>
const G = ({ children, ...p }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[1.15em] shrink-0" {...p}>
    {children}
  </svg>
)

export const PhoneGlyph = (p: P) => (
  <G {...p}>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1Z" />
  </G>
)

export const MenuGlyph = (p: P) => (
  <G {...p}>
    <path d="M5 3h11a3 3 0 0 1 3 3v15l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 0 1 1-2Zm3 5v2h8V8Zm0 4v2h8v-2Z" />
  </G>
)

export const BagGlyph = (p: P) => (
  <G {...p}>
    <path d="M7 8V7a5 5 0 0 1 10 0v1h2.2a1 1 0 0 1 1 .9l1 12a1 1 0 0 1-1 1.1H3.8a1 1 0 0 1-1-1.1l1-12a1 1 0 0 1 1-.9Zm2 0h6V7a3 3 0 0 0-6 0Z" />
  </G>
)

export const PinGlyph = (p: P) => (
  <G {...p}>
    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5Z" />
  </G>
)

export const FacebookGlyph = (p: P) => (
  <G {...p}>
    <path d="M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.5 2 10.6 3.8 10.6 6v2H8v3h2.6v11H14V11h2.7l.4-3Z" />
  </G>
)

export const InstagramGlyph = (p: P) => (
  <G {...p}>
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4Zm4.5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
  </G>
)

export const WhatsAppGlyph = (p: P) => (
  <G {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" />
  </G>
)

export const ArrowUpGlyph = (p: P) => (
  <G {...p}>
    <path d="M12 4 4.5 11.5l1.4 1.4L11 7.8V20h2V7.8l5.1 5.1 1.4-1.4Z" />
  </G>
)
