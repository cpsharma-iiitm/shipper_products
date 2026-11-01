import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import { useLogout } from '@/features/auth'
import styles from './AccountNav.module.scss'

const ITEMS = [
  { key: 'profile', label: 'Profile & addresses', to: paths.profile },
  { key: 'orders', label: 'My orders', to: paths.orders },
  { key: 'wallet', label: 'Wallet & rewards', to: paths.wallet },
  { key: 'saved', label: 'Saved products', to: paths.saved },
]

/**
 * Navigation between the account screens, ending in Log out. A vertical list from `lg`; on smaller screens
 * the same links become a row of pills that scrolls sideways instead of wrapping.
 */
export default function AccountNav({ className }) {
  const logout = useLogout({ redirectTo: paths.home })
  const listRef = useRef(null)
  const { pathname } = useLocation()

  // In the sideways-scrolling pill row, bring the current page's pill into view without moving the page itself.
  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector('[aria-current="page"]')
    if (!list || !active || list.scrollWidth <= list.clientWidth) return
    const offset = active.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft
    list.scrollLeft = offset - (list.clientWidth - active.offsetWidth) / 2
  }, [pathname])

  return (
    <nav aria-label="Account" className={clsx(styles.nav, className)}>
      <ul ref={listRef} className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.key}>
            <NavLink to={item.to} className={({ isActive }) => clsx(styles.link, isActive && styles.active)}>
              {item.label}
            </NavLink>
          </li>
        ))}
        <li className={styles.logoutItem}>
          <button type="button" className={clsx(styles.link, styles.logout)} disabled={logout.isPending} onClick={() => logout.mutate()}>
            Log out
          </button>
        </li>
      </ul>
    </nav>
  )
}
