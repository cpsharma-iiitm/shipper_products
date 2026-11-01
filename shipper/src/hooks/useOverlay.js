import { useEffect, useRef } from 'react'
import { useLockBodyScroll } from './useLockBodyScroll'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Open overlays, innermost last. Only the top one reacts to Escape and Tab.
const overlayStack = []

const isVisible = (element) => element.getClientRects().length > 0

// A combobox with its list open (react-select, native-like pickers) owns the next Escape: it closes
// the list, and only a further Escape closes the overlay.
const isExpandedCombobox = (target) => target instanceof Element && target.getAttribute('aria-expanded') === 'true'

/**
 * Behaviour shared by Modal and Drawer: page scroll lock, initial focus, Tab focus containment,
 * Escape to close (innermost overlay only) and focus restoration on close.
 *
 * The key handler runs in the capture phase on purpose: libraries such as react-select call
 * preventDefault() on every Escape they see, even with their menu closed, which would otherwise
 * make an overlay impossible to dismiss while a select has focus.
 *
 * Initial focus goes to [data-autofocus], else the first control in [data-overlay-body], else the
 * first focusable element, else the panel itself.
 */
export function useOverlay({ open, onClose, containerRef, closeOnEscape = true }) {
  useLockBodyScroll(open)

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const container = containerRef.current
    if (!open || !container) return undefined

    const token = Symbol('overlay')
    overlayStack.push(token)
    const previouslyFocused = document.activeElement

    const initialTarget =
      container.querySelector('[data-autofocus]') ??
      container.querySelector(`[data-overlay-body] :is(${FOCUSABLE})`) ??
      container.querySelector(FOCUSABLE) ??
      container
    initialTarget.focus({ preventScroll: true })

    const handleKeyDown = (event) => {
      if (overlayStack[overlayStack.length - 1] !== token) return

      if (event.key === 'Escape') {
        if (!closeOnEscape || isExpandedCombobox(event.target)) return
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...container.querySelectorAll(FOCUSABLE)].filter(isVisible)
      if (focusable.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (!container.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      overlayStack.splice(overlayStack.indexOf(token), 1)
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [open, containerRef, closeOnEscape])
}
