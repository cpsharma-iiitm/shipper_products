import { useEffect } from 'react'

/** Calls `handler` on a pointer press outside the element held by `ref`. */
export function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) handler(event)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [ref, handler, enabled])
}
