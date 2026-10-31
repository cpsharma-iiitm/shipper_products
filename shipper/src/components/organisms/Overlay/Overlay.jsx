import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import IconButton from '@/components/atoms/IconButton'
import { useOverlay } from '@/hooks/useOverlay'
import styles from './Overlay.module.scss'
/**
* Internal base for Modal and Drawer; import those instead.
*
* Rendered through a portal and layered with the z-index tokens (drawer < modal < popover < toast)
* rather than the browser top layer, so react-select menus and toasts stay visible above it.
*/
export default function Overlay({
    open,
    onClose,
    placement,
    size,
    title,
    description,
    footer,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className,
    children,
}) {
    const panelRef = useRef(null)
    const titleId = useId()
    const descriptionId = useId()
    useOverlay({ open, onClose, containerRef: panelRef, closeOnEscape })
    if (!open) return null
    return createPortal(
        <div
            className={clsx(styles.root, styles[placement])}
            onMouseDown={(event) => {
                if (closeOnBackdrop && event.target === event.currentTarget) onClose()
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={clsx(styles.panel, size && styles[size], className)}
            >
                <header className={styles.header}>
                    <div className={styles.heading}>
                        <h2 id={titleId} className={styles.title}>
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className={styles.description}>
                                {description}
                            </p>
                        )}
                    </div>
                    <IconButton icon="x-lg" label="Close" onClick={onClose} />
                </header>
                <div className={styles.body} data-overlay-body>
                    {children}
                </div>
                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </div>,
        document.body,
    )
}