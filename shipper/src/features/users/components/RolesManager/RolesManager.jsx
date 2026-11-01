import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import Alert from '@/components/molecules/Alert'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import PermissionMatrix from '@/features/users/components/PermissionMatrix'
import RoleDetailsModal from '@/features/users/components/RoleDetailsModal'
import RoleList from '@/features/users/components/RoleList'
import { useDeleteRole, useRoles, useUpdateRole } from '@/features/users/hooks/useRoles'
import { samePermissions } from '@/features/users/lib/permissions'
import { pluralize } from '@/lib/format'
import { formatDateTime } from '@/lib/date'
import styles from './RolesManager.module.scss'

/**
 * Roles and their permissions. This is display and editing UI only: the matrix edits a role's permissions and
 * saves them through the API, but nothing here authorizes anything. Authorization is backend work: the backend
 * checks every request against the signed-in user's role.
 *
 * Edits live in a local draft keyed by role id, so switching roles keeps unsaved changes until they are saved
 * or discarded.
 */
export default function RolesManager() {
  const { data, isPending, isError, error, refetch } = useRoles()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [chosenId, setChosenId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [detailsTarget, setDetailsTarget] = useState(null) // null = closed, { role: null } = create, { role } = edit
  const [deleting, setDeleting] = useState(false)

  const roles = data?.items ?? []
  const modules = data?.modules ?? []
  const role = roles.find((entry) => entry.id === chosenId) ?? roles[0]
  const draft = role ? drafts[role.id] : undefined
  const permissions = draft ?? role?.permissions
  const dirty = Boolean(role && draft && !samePermissions(draft, role.permissions))
  const draftIds = new Set(roles.filter((entry) => drafts[entry.id] && !samePermissions(drafts[entry.id], entry.permissions)).map((entry) => entry.id))

  const clearDraft = (id) =>
    setDrafts((current) => {
      const { [id]: _removed, ...rest } = current
      return rest
    })

  const save = () =>
    updateRole.mutate(
      { id: role.id, permissions: draft },
      {
        onSuccess: () => {
          toast.success(`Permissions for ${role.name} were saved.`)
          clearDraft(role.id)
        },
        onError: (failure) => toast.error(getErrorMessage(failure)),
      },
    )

  const confirmDelete = () =>
    deleteRole.mutate(role.id, {
      onSuccess: () => {
        toast.success(`${role.name} was deleted.`)
        clearDraft(role.id)
        setChosenId(null)
        setDeleting(false)
      },
      onError: (failure) => {
        toast.error(getErrorMessage(failure))
        setDeleting(false)
      },
    })

  const header = (
    <PageHeader
      title="User roles"
      description="Choose what each role can read and change across the dashboard."
      actions={
        <Button size="sm" leftIcon="plus-lg" disabled={!data} onClick={() => setDetailsTarget({ role: null })}>
          New role
        </Button>
      }
    />
  )

  if (isError) {
    return (
      <div className={styles.page}>
        {header}
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {header}

      <div className={styles.columns}>
        <RoleList roles={roles} loading={isPending} selectedId={role?.id} draftIds={draftIds} onSelect={setChosenId} />

        {isPending || !role ? (
          <Skeleton height="30rem" radius="var(--sh-radius-md)" />
        ) : (
          <Card
            title={`${role.name} permissions`}
            padding="md"
            radius="md"
            actions={
              !role.system && (
                <>
                  <Button variant="secondary" size="sm" leftIcon="pencil" onClick={() => setDetailsTarget({ role })}>
                    Edit details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon="trash"
                    disabled={role.usersCount > 0}
                    title={role.usersCount > 0 ? 'Reassign its users before deleting this role' : undefined}
                    onClick={() => setDeleting(true)}
                  >
                    Delete
                  </Button>
                </>
              )
            }
          >
            <div className={styles.editor}>
              <p className={styles.meta}>
                {role.description || 'No description.'}{' '}
                <Link to={`${paths.admin.users}?role=${encodeURIComponent(role.id)}`} className={styles.link}>
                  {pluralize(role.usersCount, 'user')} assigned
                </Link>
                {' · '}Updated {formatDateTime(role.updatedAt)}
              </p>

              {role.system && (
                <Alert tone="info">The Administrator role is built in. It always has full access, so it cannot be changed or deleted.</Alert>
              )}

              <PermissionMatrix modules={modules} permissions={permissions} readOnly={role.system} onChange={(next) => setDrafts((current) => ({ ...current, [role.id]: next }))} />

              {dirty && (
                <div className={styles.saveBar} role="region" aria-label="Unsaved permission changes">
                  <p className={styles.saveText}>You have unsaved changes to {role.name}.</p>
                  <Button variant="secondary" size="sm" disabled={updateRole.isPending} onClick={() => clearDraft(role.id)}>
                    Discard
                  </Button>
                  <Button size="sm" loading={updateRole.isPending} onClick={save}>
                    Save permissions
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <RoleDetailsModal
        open={detailsTarget !== null}
        role={detailsTarget?.role ?? null}
        roles={roles}
        onClose={() => setDetailsTarget(null)}
        onSaved={(saved) => setChosenId(saved.id)}
      />

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={confirmDelete}
        loading={deleteRole.isPending}
        tone="danger"
        title={`Delete ${role?.name ?? 'role'}?`}
        message="The role and its permissions will be removed. This cannot be undone."
        confirmLabel="Delete role"
      />
    </div>
  )
}
