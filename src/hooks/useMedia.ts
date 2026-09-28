import { useSyncExternalStore } from 'react'

export function useMedia(query: string, fallback = false) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')
