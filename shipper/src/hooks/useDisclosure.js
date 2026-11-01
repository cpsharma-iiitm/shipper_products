import { useCallback, useState } from 'react'

/** Open/close state for modals, drawers and menus. */
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((current) => !current), [])
  return { isOpen, open, close, toggle }
}
