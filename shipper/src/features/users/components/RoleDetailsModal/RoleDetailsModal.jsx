import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import FormField from '@/components/molecules/FormField'
import Modal from '@/components/organisms/Modal'
import { useCreateRole, useUpdateRole } from '@/features/users/hooks/useRoles'
import { roleSchema } from '@/features/users/schemas/roleSchema'

const FORM_ID = 'role-details-form'

function RoleDetailsForm({ role, roles, mutation, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: role?.name ?? '', description: role?.description ?? '', copyFrom: '' },
  })

  const onSubmit = handleSubmit(({ name, description, copyFrom }) => {
    const payload = role ? { id: role.id, name, description } : { name, description, ...(copyFrom ? { copyFrom } : {}) }
    mutation.mutate(payload, {
      onSuccess: (saved) => {
        toast.success(role ? `${saved.name} was updated.` : `${saved.name} was created. Choose its permissions next.`)
        onSaved(saved)
        onClose()
      },
      onError: (error) => {
        const fieldErrors = Object.entries(error.details ?? {})
        if (fieldErrors.length === 0) return toast.error(error.message)
        fieldErrors.forEach(([field, message], index) => setError(field, { type: 'server', message }, { shouldFocus: index === 0 }))
      },
    })
  })

  return (
    <form id={FORM_ID} className="row g-3" onSubmit={onSubmit} noValidate>
      <div className="col-12">
        <FormField label="Role name" required error={errors.name?.message}>
          {(control) => <Input {...control} {...register('name')} autoComplete="off" placeholder="For example, Catalogue Editor" />}
        </FormField>
      </div>
      <div className="col-12">
        <FormField label="Description" hint="Optional. Shown on the role list." error={errors.description?.message}>
          {(control) => <Input {...control} {...register('description')} autoComplete="off" placeholder="What this role is for" />}
        </FormField>
      </div>
      {!role && (
        <div className="col-12">
          <FormField label="Start from" hint="Copies another role's permissions. You can change them afterwards.">
            {(control) => (
              <Select {...control} {...register('copyFrom')}>
                <option value="">No access (start blank)</option>
                {roles.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
      )}
    </form>
  )
}

/** Create a role (no `role`) or edit a role's name and description. Permissions are edited in the matrix. */
export default function RoleDetailsModal({ open, role, roles, onClose, onSaved }) {
  const create = useCreateRole()
  const update = useUpdateRole()
  const mutation = role ? update : create

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={role ? 'Edit role details' : 'New role'}
      closeOnBackdrop={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      footer={
        <>
          <Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            {role ? 'Save details' : 'Create role'}
          </Button>
        </>
      }
    >
      <RoleDetailsForm key={role?.id ?? 'new'} role={role} roles={roles} mutation={mutation} onClose={onClose} onSaved={onSaved} />
    </Modal>
  )
}
