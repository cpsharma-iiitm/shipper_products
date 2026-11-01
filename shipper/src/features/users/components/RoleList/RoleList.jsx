import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import { pluralize } from '@/lib/format'
import styles from './RoleList.module.scss'

/** The roles to pick from, with how many users hold each (a link to the Users list filtered by that role). */
export default function RoleList({ roles, loading, selectedId, draftIds, onSelect }) {
  return (
    <Card title="Roles" padding="sm" radius="md">
      {loading ? (
        <div className={styles.skeletons} aria-busy="true" aria-label="Loading roles">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} height="4.25rem" radius="var(--sh-radius-md)" />
          ))}
        </div>
      ) : (
        <ul className={styles.list}>
          {roles.map((role) => {
            const selected = role.id === selectedId
            return (
              <li key={role.id} className={clsx(styles.item, selected && styles.selected)}>
                <button type="button" className={styles.select} aria-pressed={selected} onClick={() => onSelect(role.id)}>
                  <span className={styles.name}>
                    {role.name}
                    {role.system && <Badge tone="neutral">Built in</Badge>}
                    {draftIds.has(role.id) && <Badge tone="warning">Unsaved</Badge>}
                  </span>
                  <span className={styles.description}>{role.description || 'No description'}</span>
                </button>
                <Link to={`${paths.admin.users}?role=${encodeURIComponent(role.id)}`} className={styles.users}>
                  {pluralize(role.usersCount, 'user')}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
