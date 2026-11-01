import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { adminSidebarToggled, selectAdminSidebarCollapsed } from '@/app/store'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useOverlay } from '@/hooks/useOverlay'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import styles from './AdminLayout.module.scss'

/** Admin shell: collapsible sidebar (off-canvas on small screens), sticky header and the page outlet. */
export default function AdminLayout() {
  const dispatch = useDispatch()
  const collapsed = useSelector(selectAdminSidebarCollapsed)
  const mobileMenu = useDisclosure()
  const sidebarRef = useRef(null)

  // The off-canvas menu behaves like a dialog: focus stays inside, Escape closes, page scroll locks.
  useOverlay({ open: mobileMenu.isOpen, onClose: mobileMenu.close, containerRef: sidebarRef })

  // Admin screens use the denser form-control scale (styles/_root.scss). The attribute sits on <html> so
  // modals and drawers rendered through portals, outside this shell, follow suit.
  useEffect(() => {
    document.documentElement.dataset.area = 'admin'
    return () => {
      delete document.documentElement.dataset.area
    }
  }, [])

  return (
    <div className={clsx(styles.shell, collapsed && styles.collapsed)}>
      <AdminSidebar
        ref={sidebarRef}
        collapsed={collapsed}
        open={mobileMenu.isOpen}
        onToggleCollapse={() => dispatch(adminSidebarToggled())}
        onNavigate={mobileMenu.close}
      />
      {mobileMenu.isOpen && <div className={styles.scrim} onClick={mobileMenu.close} aria-hidden="true" />}
      <div className={styles.body}>
        <AdminHeader onOpenMenu={mobileMenu.open} menuExpanded={mobileMenu.isOpen} />
        <main id="main-content" className={styles.content} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
