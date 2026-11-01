import Avatar from '@/components/atoms/Avatar'
import IconButton from '@/components/atoms/IconButton'
import StatusBadge from '@/components/atoms/StatusBadge'
import DataTable from '@/components/organisms/DataTable'
import { formatMobile } from '@/lib/address'
import { formatDateTime } from '@/lib/date'
import styles from './UsersTable.module.scss'

/**
 * The admin user list. Paging, sorting and filtering are the backend's; this shows the current page.
 * `currentUserId` is the signed-in admin: their row cannot be deactivated or deleted (the backend refuses it too).
 */
export default function UsersTable({ rows, loading, sort, onSortChange, pagination, emptyState, currentUserId, busyUserId, onEdit, onToggleStatus, onDelete }) {
  const columns = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      cell: (row) => (
        <span className={styles.user}>
          <Avatar name={row.name} size="sm" />
          <span className={styles.stacked}>
            <span className={styles.name}>
              {row.name}
              {row.id === currentUserId && <span className={styles.you}>You</span>}
            </span>
            <span className={styles.secondary}>{row.email}</span>
          </span>
        </span>
      ),
    },
    { key: 'mobile', header: 'Mobile', cell: (row) => (row.mobile ? formatMobile(row.mobile) : '—') },
    { key: 'roleName', header: 'Role', sortable: true },
    { key: 'status', header: 'Status', sortable: true, cell: (row) => <StatusBadge status={row.status} /> },
    { key: 'lastActiveAt', header: 'Last active', sortable: true, cell: (row) => (row.lastActiveAt ? formatDateTime(row.lastActiveAt) : 'Never') },
  ]

  return (
    <DataTable
      caption="Admin users"
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      loading={loading}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      emptyState={emptyState}
      actionsHeader="Actions"
      minWidth="52rem"
      rowActions={(row) => {
        const isSelf = row.id === currentUserId
        const active = row.status === 'active'
        return (
          <span className={styles.actions}>
            <IconButton icon="pencil" label={`Edit ${row.name}`} size="sm" onClick={() => onEdit(row)} />
            <IconButton
              icon={active ? 'person-dash' : 'person-check'}
              label={active ? `Deactivate ${row.name}` : `Activate ${row.name}`}
              size="sm"
              disabled={(isSelf && active) || busyUserId === row.id}
              title={isSelf && active ? "You can't deactivate your own account" : undefined}
              onClick={() => onToggleStatus(row)}
            />
            <IconButton
              icon="trash"
              label={`Delete ${row.name}`}
              size="sm"
              tone="danger"
              disabled={isSelf}
              title={isSelf ? "You can't delete your own account" : undefined}
              onClick={() => onDelete(row)}
            />
          </span>
        )
      }}
    />
  )
}
