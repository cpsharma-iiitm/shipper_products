import { useEffect } from 'react'

// Reference-counted so stacked overlays (a confirm dialog over a drawer) lock and unlock once.
let lockCount = 0
let savedStyles = null

function lock() {
  if (lockCount === 0) {
    const { body, documentElement } = document
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth
    savedStyles = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
    body.style.overflow = 'hidden'
    // Keep the layout from shifting when the page scrollbar disappears.
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`
  }
  lockCount += 1
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0 && savedStyles) {
    document.body.style.overflow = savedStyles.overflow
    document.body.style.paddingRight = savedStyles.paddingRight
    savedStyles = null
  }
}

/** Disables page scrolling while `locked` is true. */
export function useLockBodyScroll(locked = true) {
  useEffect(() => {
    if (!locked) return undefined
    lock()
    return unlock
  }, [locked])
}
