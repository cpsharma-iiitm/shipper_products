import { useState } from 'react'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/app/store'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import { ListToolbar, useListParams } from '@/features/admin-lists'
import UserFormModal from '@/features/users/components/UserFormModal'
import UsersTable from '@/features/users/components/UsersTable'
import { USER_STATUS_OPTIONS } from '@/features/users/constants/userOptions'
import { useRoles } from '@/features/users/hooks/useRoles'
import { useDeleteUser, useSetUserStatus, useUsers } from '@/features/users/hooks/useUsers'
import styles from './UsersList.module.scss'

/** The admin Users screen: who can sign in to the dashboard, with their role and status. */
export default function UsersList() {
  const currentUser = useSelector(selectCurrentUser)
  const list = useListParams({ pageSize: 10, filters: { role: '', status: '' } })
  const { data, isPending, isError, error, refetch } = useUsers(list.apiParams)
  const { data: roleData } = useRoles()
  const roles = roleData?.items ?? []
  const setStatus = useSetUserStatus()
  const remove = useDeleteUser()

  // null = closed, { user: null } = add, { user } = edit
  const [formTarget, setFormTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const toggleStatus = (user) => {
    const status = user.status === 'active' ? 'inactive' : 'active'
    setStatus.mutate(
      { id: user.id, status },
      {
        onSuccess: () => toast.success(`${user.name} is now ${status}.`),
        onError: (failure) => toast.error(getErrorMessage(failure)),
      },
    )
  }

  const confirmDelete = () =>
    remove.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`${deleteTarget.name} was deleted.`)
        setDeleteTarget(null)
      },
      onError: (failure) => {
        toast.error(getErrorMessage(failure))
        setDeleteTarget(null)
      },
    })

  const toolbarFilters = [
    {
      key: 'role',
      label: 'Role',
      prefix: 'Role:',
      options: [{ value: '', label: 'All' }, ...roles.map((role) => ({ value: role.id, label: role.name }))],
      value: list.filters.role,
      onChange: (value) => list.setFilter('role', value),
    },
    {
      key: 'status',
      label: 'Status',
      prefix: 'Status:',
      options: USER_STATUS_OPTIONS,
      value: list.filters.status,
      onChange: (value) => list.setFilter('status', value),
    },
  ]

  return (
    <div className={styles.page}>
      <PageHeader
        title="Users"
        description="People who can sign in to the admin dashboard. Their role decides what they can see and change."
        actions={
          <Button size="sm" leftIcon="plus-lg" onClick={() => setFormTarget({ user: null })}>
            Add user
          </Button>
        }
      />

      <ListToolbar
        search={{ ...list.search, label: 'Search users', placeholder: 'Search name, email or mobile' }}
        filters={toolbarFilters}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
      />

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <UsersTable
          rows={data?.items ?? []}
          loading={isPending}
          sort={list.sortState}
          onSortChange={list.setSort}
          currentUserId={currentUser?.id}
          busyUserId={setStatus.isPending ? setStatus.variables?.id : null}
          onEdit={(user) => setFormTarget({ user })}
          onToggleStatus={toggleStatus}
          onDelete={setDeleteTarget}
          emptyState={
            <EmptyState
              compact
              icon="person-x"
              title="No users match these filters"
              description="Try a different search, or clear the filters to see every user."
              action={
                <Button variant="secondary" size="sm" onClick={list.reset}>
                  Clear filters
                </Button>
              }
            />
          }
          pagination={data && { page: data.page, pageSize: data.pageSize, totalItems: data.totalItems, onPageChange: list.setPage, itemLabel: 'users' }}
        />
      )}

      <UserFormModal
        open={formTarget !== null}
        user={formTarget?.user ?? null}
        roles={roles}
        currentUserId={currentUser?.id}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        tone="danger"
        title={`Delete ${deleteTarget?.name ?? 'user'}?`}
        message="They will no longer be able to sign in. This cannot be undone. To keep their history, deactivate the account instead."
        confirmLabel="Delete user"
      />
    </div>
  )
}
