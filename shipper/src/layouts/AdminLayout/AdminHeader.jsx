import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useMatches, useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { selectCurrentUser } from '@/app/store'
import Avatar from '@/components/atoms/Avatar'
import Icon from '@/components/atoms/Icon'
import IconButton from '@/components/atoms/IconButton'
import Popover from '@/components/molecules/Popover'
import SearchField from '@/components/molecules/SearchField'
import { useLogout } from '@/features/auth'
import NotificationsMenu from '@/features/dashboard/components/NotificationsMenu'
import styles from './AdminHeader.module.scss'

const ROLE_LABELS = { admin: 'Administrator' }

function Breadcrumb() {
  const matches = useMatches()
  const crumbs = matches.flatMap((match) => (match.handle?.crumb ? [match.handle.crumb] : []))

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol>
        <li>Workspace</li>
        {crumbs.map((crumb, index) => (
          <li key={`${crumb}-${index}`} aria-current={index === crumbs.length - 1 ? 'page' : undefined}>
            {crumb}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function AdminHeader({ onOpenMenu, menuExpanded }) {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const logout = useLogout({ redirectTo: paths.admin.login })
  const [query, setQuery] = useState('')

  // ASSUMPTION — confirm with backend team (B-15): global search is handled by the Orders list
  // (?q=) until a cross-entity search endpoint exists.
  const search = (value) => {
    const trimmed = value.trim()
    if (trimmed) navigate({ pathname: paths.admin.orders, search: `?q=${encodeURIComponent(trimmed)}` })
  }

  return (
    <header className={styles.header}>
      <IconButton
        icon="list"
        label="Open menu"
        size="lg"
        className={styles.menuButton}
        aria-controls="admin-sidebar"
        aria-expanded={menuExpanded}
        onClick={onOpenMenu}
      />
      <Breadcrumb />
      <SearchField
        className={styles.search}
        variant="filled"
        size="md"
        value={query}
        onChange={setQuery}
        onSubmit={search}
        placeholder="Search orders, products, customers"
        aria-label="Search orders, products, customers"
      />

      <div className={styles.actions}>
        <NotificationsMenu />
        <Popover
          align="end"
          panelClassName={styles.menuPanel}
          trigger={({ props }) => (
            <button type="button" className={styles.user} {...props}>
              <Avatar name={user?.name} />
              <span className={styles.identity}>
                <span className={styles.name}>{user?.name}</span>
                <span className={styles.role}>
                  {ROLE_LABELS[user?.role] ?? user?.role}
                  <Icon name="chevron-down" />
                </span>
              </span>
            </button>
          )}
        >
          {({ close }) => (
            <ul>
              <li>
                <Link to={paths.admin.profile} className={styles.menuItem} onClick={close}>
                  <Icon name="person" /> Profile
                </Link>
              </li>
              <li>
                <button type="button" className={styles.menuItem} onClick={() => logout.mutate()}>
                  <Icon name="box-arrow-right" /> Log out
                </button>
              </li>
            </ul>
          )}
        </Popover>
      </div>
    </header>
  )
}
