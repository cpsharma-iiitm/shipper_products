import { useEffect, useId, useRef } from 'react'
import clsx from 'clsx'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import styles from './Popover.module.scss'
/**
* Anchored panel for menus, pickers and small forms. Closes on outside click and Escape, and returns
* focus to the trigger when the panel had it.
* * <Popover align="end" trigger={({ props, isOpen }) => <button {...props}>Account</button>}>
* {({ close }) => <nav>…</nav>}
* </Popover>
* * `trigger` receives { props, isOpen }. Spread `props` (ref, onClick and the aria attributes) onto
* the button; use `isOpen` for styling.
*/
export default function Popover({ trigger, children, align = 'start', panelClassName, className }) {
  const { isOpen, close, toggle } = useDisclosure()
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const panelId = useId()
  useOnClickOutside(rootRef, close, isOpen)
  // When the panel closes while it held focus, focus would fall back to <body>; return it to the
  // trigger instead. If the user clicked elsewhere, focus is already there and is left alone.
  useEffect(() => {
    if (!isOpen) return undefined
    const trigger = triggerRef.current
    return () => {
      if (document.activeElement === document.body) trigger?.focus()
    }
  }, [isOpen])
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isOpen) {
      event.stopPropagation()
      close()
    }
  }
  const triggerProps = {
    ref: triggerRef,
    onClick: toggle,
    'aria-expanded': isOpen,
    'aria-haspopup': 'true',
    'aria-controls': isOpen ? panelId : undefined,
  }
  return (
    <div ref={rootRef} className={clsx(styles.root, className)} onKeyDown={handleKeyDown}>
      {trigger({ props: triggerProps, isOpen })}
      {isOpen && (
        <div id={panelId} className={clsx(styles.panel, align === 'end' && styles.alignEnd, panelClassName)}>
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  )
}