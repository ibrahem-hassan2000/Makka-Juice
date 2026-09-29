import type { ComponentType } from 'react'
import { cn } from '../../lib/utils'
import { ICONS, type IconKey } from './icons'

/**
 * Pre-rendered 3D sprites (tools/render → src/assets/render). They are plain transparent WebP images, so the
 * page pays no WebGL cost: fruit decoration, the signature cups and the hero cup's stackable passes.
 */
const FILES = import.meta.glob('../../assets/render/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const render = (name: string) => {
  const url = FILES[`../../assets/render/${name}.webp`]
  if (!url) throw new Error(`missing render: ${name}`)
  return url
}

const PHOTO_KEYS = [
  'strawberry', 'mango', 'orange', 'lemon', 'kiwi', 'avocado', 'banana',
  'berries', 'mint', 'watermelon', 'pomegranate', 'peach', 'grapes',
] as const satisfies readonly IconKey[]

type ArtProps = { className?: string; eager?: boolean }

const photo = (key: string): ComponentType<ArtProps> => {
  const src = render(key)
  function FruitPhoto({ className, eager }: ArtProps) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
        width={384}
        height={384}
        className={cn('pointer-events-none select-none', className)}
      />
    )
  }
  return FruitPhoto
}

/** Decoration fruit: the realistic render when there is one, the flat icon otherwise. */
export const FRUIT = Object.fromEntries(
  (Object.keys(ICONS) as IconKey[]).map((k) => [k, (PHOTO_KEYS as readonly string[]).includes(k) ? photo(k) : ICONS[k]]),
) as Record<IconKey, ComponentType<ArtProps>>
