import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Icon from '@/components/atoms/Icon'
import Logo from '@/components/atoms/Logo'
import { useLogout } from '@/features/auth'
import { ADMIN_NAV } from './navigation'
import styles from './AdminSidebar.module.scss'

/**
 * Admin navigation. `collapsed` (desktop preference) shows icons only; on small screens the sidebar
 * is an off-canvas panel controlled by `open`, and always shows labels.
 */
export default function AdminSidebar({ ref, collapsed, open, onToggleCollapse, onNavigate }) {
  const logout = useLogout({ redirectTo: paths.admin.login })

  return (
    <aside ref={ref} id="admin-sidebar" aria-label="Admin" className={clsx(styles.sidebar, collapsed && styles.collapsed, open && styles.open)}>
      <div className={styles.brand}>
        {collapsed ? (
          <Link to={paths.admin.dashboard} className={styles.collapsedMark} aria-label="Shipper.com admin home">
            <Icon name="box-seam" />
          </Link>
        ) : (
          <Logo as={Link} to={paths.admin.dashboard} size="md" aria-label="Shipper.com admin home" />
        )}
        <p className={styles.workspace}>{collapsed ? 'OPS' : 'WORKSPACE / ADMIN'}</p>
      </div>

      <nav aria-label="Admin sections">
        <ul className={styles.list}>
          {ADMIN_NAV.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
              >
                <Icon name={item.icon} />
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button type="button" className={styles.item} title={collapsed ? 'Logout' : undefined} onClick={() => logout.mutate()}>
              <Icon name="box-arrow-right" />
              <span className={styles.label}>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        className={clsx(styles.item, styles.collapseToggle)}
        onClick={onToggleCollapse}
        aria-pressed={collapsed}
        title={collapsed ? 'Expand menu' : undefined}
      >
        <Icon name={collapsed ? 'layout-sidebar-inset-reverse' : 'layout-sidebar-inset'} />
        <span className={styles.label}>{collapsed ? 'Expand menu' : 'Collapse menu'}</span>
      </button>
    </aside>
  )
}
